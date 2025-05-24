const express = require("express");
const makeWASocket = require("@whiskeysockets/baileys").default;
const {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const P = require("pino");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
require("dotenv").config();
require('events').EventEmitter.defaultMaxListeners = 100;

const app = express();
app.get("/", (req, res) => res.send("Fatuma WhatsApp Bot is running!"));
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port " + (process.env.PORT || 3000));
});

// Settings
const PREFIX = process.env.PREFIX || "!";
const OWNER_JID = process.env.OWNER_NUMBER?.replace(/[^0-9]/g, '') + "@s.whatsapp.net" || "255760317060@s.whatsapp.net";
const AUTO_BIO = process.env.AUTO_BIO === "on";
const AUTO_TYPING = process.env.AUTO_TYPING === "on";
const AUTO_RECORD = process.env.AUTO_RECORD === "on";

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: "silent" }))
    },
    logger: P({ level: "silent" }),
  });

  sock.ev.on("connection.update", (update) => {
    const { qr } = update;
    if (qr) qrcode.generate(qr, { small: true });
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    } else if (connection === "open") {
      console.log("✅ Bot connected!");

      const menu = `
🔰 *WELCOME TO BEN WHITTAKER TECH BOT* 🔰

✅ *Bot is now online and connected successfully!*

🔧 *Prefix:* ${PREFIX}
🤖 *Bot Name:* BEN WHITTAKER TECH
👑 *Owner:* @${OWNER_JID.split("@")[0]}

ℹ️ Type *${PREFIX}menu* or *${PREFIX}help* to see available commands.

📌 *Need assistance?* Just type *${PREFIX}support*.
      `;
      await sock.sendMessage(OWNER_JID, { text: menu, mentions: [OWNER_JID] });

      if (AUTO_BIO) {
        try {
          const newBio = `🤖 Online | Prefix: ${PREFIX}`;
          await sock.updateProfileStatus(newBio);
          console.log("✅ Auto Bio updated:", newBio);
        } catch (err) {
          console.error("❌ Failed to update bio:", err.message);
        }
      }
    }
  });

  const warnedUsers = {};
  
  const commands = new Map();
  const commandsPath = path.join(__dirname, "commands");
  if (fs.existsSync(commandsPath)) {
    for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"))) {
      const cmd = require(path.join(commandsPath, file));
      if (cmd.name) commands.set(cmd.name.toLowerCase(), cmd);
    }
  } else {
    fs.mkdirSync(commandsPath);
    console.log("Created commands folder.");
  }

  // Listen for incoming messages
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const sender = msg.key.participant || msg.key.remoteJid;
    const body = msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                msg.message?.imageMessage?.caption || "";
  
  
    // Auto Typing/Recording
    if (AUTO_TYPING) {
      await sock.sendPresenceUpdate('composing', from);
      setTimeout(() => {
        sock.sendPresenceUpdate('paused', from);
          },  3000);
    
    // FAKE RECORDING PRESENCE
    await sock.sendPresenceUpdate("recording", from);
    setTimeout(() => {
      sock.sendPresenceUpdate("available", from);
    }, 5000);

    // Anti-Link Detector
    if (jid.endsWith("@g.us") && text.includes("https://chat.whatsapp.com/")) {
      try {
        const groupMetadata = await sock.groupMetadata(jid);
        const isAdmin = groupMetadata.participants.find(p => p.id === sender && (p.admin === "admin" || p.admin === "superadmin"));
        const botAdmin = groupMetadata.participants.find(p => p.id === sock.user.id && (p.admin === "admin" || p.admin === "superadmin"));

        if (botAdmin) {
          if (isAdmin) {
            await sock.sendMessage(jid, { text: `⚠️ Admin @${sender.split("@")[0]} posted a group link. Skipping remove.`, mentions: [sender] });
          } else {
            await sock.sendMessage(jid, { text: `🚫 Link detected! Removing @${sender.split("@")[0]}...`, mentions: [sender] });
            await sock.groupParticipantsUpdate(jid, [sender], "remove");
          }
        } else {
          warnedUsers[sender] = (warnedUsers[sender] || 0) + 1;
          await sock.sendMessage(jid, { text: `⚠️ @${sender.split("@")[0]}, stop posting links. Warn: ${warnedUsers[sender]}`, mentions: [sender] });
        }
      } catch (e) {
        console.error("Antilink error:", e);
      }
    }

Command execution
    for (const [name, command] of commands) {
      if (body.toLowerCase().startsWith(PREFIX + name)) {
        try {
          const args = body.trim().split(/\s+/).slice(1);
          await command.execute(sock, msg, args);
        } catch (err) {
          console.error(`Error executing command ${name}:`, err);
        }
        break;
      }
    }
    
  });
}

startBot();
