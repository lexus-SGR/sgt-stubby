require('events').EventEmitter.defaultMaxListeners = 100;
require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const P = require("pino");
const qrcode = require("qrcode-terminal");
const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

const BRAND = "🤖 *Unknown-Corps*";
const app = express();
app.get("/", (req,res)=>res.send(`${BRAND} is running!`));
app.listen(process.env.PORT || 3000, ()=>console.log(`Server running on port ${process.env.PORT||3000}`));

const OWNER_NUMBER = process.env.OWNER_NUMBER || "255760317060";
const OWNER_JID = OWNER_NUMBER + "@s.whatsapp.net";
const PREFIX = ".";
const AUTO_VIEW_STATUS = process.env.AUTO_VIEW_STATUS === "on";
const AUTO_REACT_EMOJI = process.env.AUTO_REACT_EMOJI || "❤️"; // default emoji
const ANTIDELETE = process.env.ANTIDELETE === "on"; // turn on/off antidelete
const RECORD_VOICE_FAKE = process.env.RECORD_VOICE_FAKE === "on"; // fake recording

// Load commands from commands folder
const commands = new Map();
const commandsPath = path.join(__dirname, "commands");
if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);
fs.readdirSync(commandsPath).filter(f=>f.endsWith(".js")).forEach(file=>{
    try {
        const cmd = require(path.join(commandsPath,file));
        if(cmd.name) commands.set(cmd.name.toLowerCase(), cmd);
    } catch(e) { console.error(`❌ Failed to load command ${file}:`,e); }
});

async function startBot(){
    const { state, saveCreds } = await useMultiFileAuthState("./auth");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({level:"silent"}))
        },
        logger: P({level:"silent"})
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({connection, qr, lastDisconnect})=>{
        if(qr) qrcode.generate(qr,{small:true});
        if(connection==="close"){
            const shouldReconnect=(lastDisconnect?.error)?.output?.statusCode!==DisconnectReason.loggedOut;
            if(shouldReconnect) startBot();
        } else if(connection==="open") console.log("✅ Bot connected!");
    });

    // Auto react on status updates and auto view
    if(AUTO_VIEW_STATUS){
        sock.ev.on("presence.update", async (update)=>{
            if(update.id && update.type==="status"){
                try{
                    // Auto view status
                    await sock.sendPresenceUpdate("available", update.id);

                    // React with emoji
                    await sock.sendMessage(update.id, { 
                        react: { text: AUTO_REACT_EMOJI, key: { remoteJid: update.id, fromMe: false, id: 'status-msg' } } 
                    });
                } catch(e){ console.error("❌ Error viewing/reacting to status:", e.message); }
            }
        });
    }

    // Messages upsert
    sock.ev.on("messages.upsert", async ({messages})=>{
        const msg = messages[0];
       // if(!msg.message) return;

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const number = sender.split("@")[0];
        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

        // Owner only check
        if(number!==OWNER_NUMBER){
            await sock.sendMessage(from,{text:`❌ Need owner privilege.`});
            return;
        }

        // Fake recording presence
        if(RECORD_VOICE_FAKE){
            try {
                await sock.sendPresenceUpdate('recording', from);
                setTimeout(async ()=>{
                    await sock.sendPresenceUpdate('available', from);
                }, 3000); // stop recording after 3 seconds
            } catch(e){ console.error("❌ Error sending fake recording:", e.message); }
        }

        // Execute command from folder
        if(body.startsWith(PREFIX)){
            const cmdName = body.slice(PREFIX.length).split(" ")[0];
            const command = commands.get(cmdName);
            if(command){
                try { await command.execute(sock,msg); }
                catch(e){ console.error(`❌ Error in command ${cmdName}:`,e); }
            }
        }
    });

    // Antidelete: resend deleted messages
    if(ANTIDELETE){
        sock.ev.on("messages.update", async (updates)=>{
            for(const update of updates){
                if(update.messageStubType===1){ // message deleted
                    try{
                        const chat = update.key.remoteJid;
                        const deletedMsgId = update.key.id;
                        const deletedMsg = await sock.loadMessage(chat, deletedMsgId);
                        if(deletedMsg) await sock.sendMessage(chat, deletedMsg.message, { quoted: deletedMsg });
                    } catch(e){ console.error("❌ Error resending deleted message:", e.message); }
                }
            }
        });
    }
}

startBot();
