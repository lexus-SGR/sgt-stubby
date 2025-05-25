require('events').EventEmitter.defaultMaxListeners = 100;
require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const P = require("pino");
const axios = require("axios");
const cheerio = require("cheerio");
const { Boom } = require("@hapi/boom");
const qrcode = require("qrcode-terminal");
const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

// Setup Express server
const app = express();
app.get("/", (req, res) => res.send("Fatuma WhatsApp Bot is running!"));
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port " + (process.env.PORT || 3000));
});

// Configuration
const OWNER_JID = "255760317060@s.whatsapp.net";
const PREFIX = "!";
const AUTO_BIO = true;
const AUTO_TYPING = true;
const AUTO_VIEW_ONCE = process.env.AUTO_VIEW_ONCE === "on" ? true : false;
const AUTO_VIEW_STATUS = process.env.AUTO_VIEW_STATUS === "on" ? true : false;
const ANTILINK_ENABLED = process.env.ANTILINK === "on";
const ANTILINK_ACTION = process.env.ANTILINK_ACTION || "remove";


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
🔰 *WELCOME TO FATUMA WHATSAPP BOT* 🔰

✅ *Bot is now online and connected successfully!*

🔧 *Prefix:* ${PREFIX}
🤖 *Bot Name:* FATUMA BOT
👑 *Owner:* @${OWNER_JID.split("@")[0]}

ℹ️ Type *${PREFIX}menu* or *${PREFIX}help* to see available commands.

📌 *Need assistance?* Just type *${PREFIX}support*.
      `;
      await sock.sendMessage(OWNER_JID, { text: menu, mentions: [OWNER_JID] });

if (AUTO_BIO) {
  try {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB'); // e.g. 24/05/2025
    const quotes = [
      "Learning never exhausts the mind.",
      "Laughter is timeless, imagination has no age.",
      "The best way to predict the future is to create it.",
      "Why don’t scientists trust atoms? Because they make up everything!",
      "Education is the most powerful weapon you can use to change the world.",
      "Why don’t skeletons fight each other? They don’t have the guts.",
      "Entertainment is the spark that lights the fire of learning!"
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    const newBio = `👑 Ben Whittaker | 👤 Fatuma | 📅 ${dateStr} | ✨ ${randomQuote} ✨ | ❤️ I love you Iren-Lovenes ❤️`;
    await sock.updateProfileStatus(newBio);
    console.log("✅ Auto Bio updated:", newBio);
  } catch (err) {
    console.error("❌ Failed to update bio:", err.message);
  }
}    
    }
  });

  const warnedUsers = true;

  const fs = require('fs');
const path = require('path');
const commands = new Map();

const commandsPath = path.join(__dirname, "commands");

if (fs.existsSync(commandsPath)) {
  for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"))) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd.name) commands.set(cmd.name.toLowerCase(), cmd);
  }
} else {
  fs.mkdirSync(commandsPath);
  console.log("✅ 'commands' folder created. Add your commands in that folder.");
}

  //Listen for incoming messages
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const sender = msg.key.participant || msg.key.remoteJid;
    const body = msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                msg.message?.imageMessage?.caption ||
                "";

sock.ev.on("messages.upsert", async ({ messages }) => {
  const msg = messages[0];
  if (!msg.message) return;

  const from = msg.key.remoteJid;
  const isGroup = from.endsWith("@g.us");
  const sender = msg.key.participant || msg.key.remoteJid;
  const body = msg.message?.conversation ||
               msg.message?.extendedTextMessage?.text ||
               msg.message?.imageMessage?.caption || "";

  const prefix = '!';
  if (body.startsWith(prefix)) {
    const commandName = body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();
    const args = body.trim().split(/ +/).slice(1);
    const command = commands.get(commandName);

    // Optional: pata group metadata na admin check
    let groupMetadata, participants, isAdmin;
    if (isGroup) {
      groupMetadata = await sock.groupMetadata(from);
      participants = groupMetadata.participants;
      const participantIds = participants.map(p => p.id);
      isAdmin = participantIds.includes(sender) && participants.find(p => p.id === sender).admin != null;
    }

    if (command) {
      try {
        await command.execute(sock, msg, args, from, sender, isGroup, groupMetadata, isAdmin);
      } catch (err) {
        console.error("❌ Error in command:", err);
      }
    }
  }
});
    
    // FAKE RECORDING PRESENCE
    await sock.sendPresenceUpdate("recording", from);
    setTimeout(() => {
      sock.sendPresenceUpdate("available", from);
    }, 10000);

// Load antilink settings from file
const fs = require('fs');
let antiLinkGroups = {};
try {
  antiLinkGroups = JSON.parse(fs.readFileSync('./antilink.json'));
} catch (err) {
  fs.writeFileSync('./antilink.json', '{}');
  antiLinkGroups = {};
}

// Inside messages.upsert listener
sock.ev.on("messages.upsert", async ({ messages }) => {
  const msg = messages[0];
  if (!msg.message) return;

  const from = msg.key.remoteJid;
  const isGroup = from.endsWith("@g.us");
  const sender = msg.key.participant || msg.key.remoteJid;

  let body = msg.message?.conversation ||
             msg.message?.extendedTextMessage?.text ||
             msg.message?.imageMessage?.caption || "";

  // Get group metadata if group
  let groupMetadata;
  if (isGroup) {
    try {
      groupMetadata = await sock.groupMetadata(from);
    } catch (err) {
      groupMetadata = null;
    }
  }

  // Antilink Command: !antilink on/off/status
  if (body.startsWith('!antilink')) {
    const isAdmin = isGroup && groupMetadata?.participants?.find(p => p.id === sender && p.admin);
    if (!isAdmin) {
      await sock.sendMessage(from, { text: '❌ Only *group admins* can use this command.' }, { quoted: msg });
      return;
    }

    const args = body.trim().split(/\s+/);
    const state = args[1]?.toLowerCase();

    if (state === 'on') {
      antiLinkGroups[from] = { enabled: true };
      fs.writeFileSync('./antilink.json', JSON.stringify(antiLinkGroups, null, 2));
      await sock.sendMessage(from, { text: '✅ *Antilink is now enabled* for this group.' }, { quoted: msg });
    } else if (state === 'off') {
      delete antiLinkGroups[from];
      fs.writeFileSync('./antilink.json', JSON.stringify(antiLinkGroups, null, 2));
      await sock.sendMessage(from, { text: '❎ *Antilink is now disabled* for this group.' }, { quoted: msg });
    } else if (state === 'status') {
      const status = antiLinkGroups[from]?.enabled ? '✅ ON' : '❎ OFF';
      await sock.sendMessage(from, { text: `ℹ️ Antilink status: *${status}*` }, { quoted: msg });
    } else {
      await sock.sendMessage(from, { text: 'ℹ️ Usage:\n*!antilink on* – Enable\n*!antilink off* – Disable\n*!antilink status* – Check status' }, { quoted: msg });
    }
    return;
  }

  // Detect group links if enabled
  if (isGroup && antiLinkGroups[from]?.enabled) {
    const text = body.toLowerCase();
    if (text.includes("https://chat.whatsapp.com")) {
      const isAdmin = groupMetadata?.participants?.find(p => p.id === sender && p.admin);
      if (!isAdmin) {
        await sock.sendMessage(from, { text: `⚠️ *WhatsApp Group Link detected! Removing ${sender.split('@')[0]}...*` }, { quoted: msg });
        await sock.groupParticipantsUpdate(from, [sender], 'remove');
      } else {
        await sock.sendMessage(from, { text: `⚠️ *Link detected, but user is an admin.*` }, { quoted: msg });
      }
    }
  }
});

    // Command execution
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
  }); // end of sock.ev.on("messages.upsert")
} // end of startBot()

startBot();
