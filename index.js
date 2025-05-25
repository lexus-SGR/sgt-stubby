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

// Setup Express
const app = express();
app.get("/", (req, res) => res.send("Fatuma WhatsApp Bot is running!"));
app.listen(process.env.PORT || 3000, () =>
  console.log("Server running on port " + (process.env.PORT || 3000))
);

// Config
const OWNER_JID = process.env.OWNER_NUMBER + "@s.whatsapp.net";
const PREFIX = "!";
const AUTO_BIO = true;
const AUTO_VIEW_ONCE = process.env.AUTO_VIEW_ONCE === "on";
const ANTILINK_ENABLED = process.env.ANTILINK === "on";
const AUTO_TYPING = process.env.AUTO_TYPING === "on";
const RECORD_VOICE_FAKE = process.env.RECORD_VOICE_FAKE === "on";
const OPEN_VIEW_ONCE = process.env.OPEN_VIEW_ONCE === "on";
const AUTO_VIEW_STATUS = process.env.AUTO_VIEW_STATUS === "on";
const AUTO_REACT_EMOJI = process.env.AUTO_REACT_EMOJI || "🚀";

// Load Antilink JSON
let antiLinkGroups = {};
try {
  antiLinkGroups = JSON.parse(fs.readFileSync('./antilink.json'));
} catch {
  fs.writeFileSync('./antilink.json', '{}');
}

// Start Bot
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: "silent" }))
    },
    logger: P({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, qr, lastDisconnect }) => {
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === "close") {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    } else if (connection === "open") {
      console.log("✅ Bot connected!");
      const welcomeText = `
🔰 *WELCOME TO FATUMA WHATSAPP BOT* 🔰

✅ *Bot is now online and connected successfully!*

🔧 *Prefix:* ${PREFIX}
🤖 *Bot Name:* FATUMA BOT
👑 *Owner:* @${OWNER_JID.split("@")[0]}

ℹ️ Type *${PREFIX}menu* or *${PREFIX}help* to see available commands.
      `;
      await sock.sendMessage(OWNER_JID, { text: welcomeText, mentions: [OWNER_JID] });

      // Auto bio
      if (AUTO_BIO) {
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-GB');
        const quotes = [
          "Learning never exhausts the mind.",
          "Laughter is timeless, imagination has no age.",
          "The best way to predict the future is to create it.",
          "Education is the most powerful weapon.",
          "Entertainment is the spark of learning!"
        ];
        const newBio = `👑 Ben Whittaker | 👤 Fatuma | 📅 ${dateStr} | ✨ ${quotes[Math.floor(Math.random() * quotes.length)]} ✨ | ❤️ I love you Iren-Lovenes ❤️`;
        try {
          await sock.updateProfileStatus(newBio);
          console.log("✅ Bio updated");
        } catch (e) {
          console.error("❌ Failed to update bio:", e.message);
        }
      }
    }
  });

  // Load commands
  const commands = new Map();
  const commandsPath = path.join(__dirname, "commands");

  if (fs.existsSync(commandsPath)) {
    for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"))) {
      const cmd = require(path.join(commandsPath, file));
      if (cmd.name) commands.set(cmd.name.toLowerCase(), cmd);
    }
  } else {
    fs.mkdirSync(commandsPath);
    console.log("✅ 'commands' folder created.");
  }
sock.ev.on("messages.upsert", async ({ messages }) => {
  try {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const sender = msg.key.participant || msg.key.remoteJid;
    const body = msg.message?.conversation ||
                 msg.message?.extendedTextMessage?.text ||
                 msg.message?.imageMessage?.caption || "";

    const commandName = body.startsWith(PREFIX)
      ? body.slice(PREFIX.length).split(/\s+/)[0].toLowerCase()
      : null;

    const args = body.trim().split(/\s+/).slice(1);
    const command = commands.get(commandName);

    let groupMetadata, isAdmin, botIsAdmin;
    if (isGroup) {
      groupMetadata = await sock.groupMetadata(from);
      const participant = groupMetadata.participants.find(p => p.id === sender);
      isAdmin = participant?.admin != null;

      const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";
      botIsAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin != null;
    }

    const isOwnerAdmin = (OWNER_NUMBER === sender.split("@")[0]) || isAdmin;

    if (isOwnerAdmin) {
      if (AUTO_TYPING) {
        await sock.sendPresenceUpdate('composing', from);
      }

      if (RECORD_VOICE_FAKE) {
        await sock.sendPresenceUpdate('recording', from);
      }

      if (AUTO_REACT_EMOJI) {
        const emoji = AUTO_REACT_EMOJI.split('....')[0];
        await sock.sendMessage(from, {
          react: {
            text: emoji,
            key: msg.key
          }
        });
      }

      if (body === "!viewonce" && OPEN_VIEW_ONCE) {
        const buffer = fs.readFileSync('./media/sample.jpg'); // make sure file exists
        await sock.sendMessage(from, {
          image: buffer,
          caption: "This is no longer a view once message.",
          viewOnce: false
        }, { quoted: msg });
      }
    }

    // Antilink feature
    if (ANTILINK_ENABLED && isGroup && antiLinkGroups[from]?.enabled) {
      if (body.includes("https://chat.whatsapp.com")) {
        if (!isAdmin) {
          if (botIsAdmin) {
            await sock.sendMessage(from, { text: `⚠️ WhatsApp group link detected. Removing ${sender.split("@")[0]}...` });
            await sock.groupParticipantsUpdate(from, [sender], "remove");
          } else {
            await sock.sendMessage(from, { text: `⚠️ WhatsApp group link detected, but I am not admin so I cannot remove users.` });
          }
        } else {
          await sock.sendMessage(from, { text: `⚠️ Link detected, but user is an admin.` });
        }
        return;
      }
    }

    // Antilink command
    if (body.startsWith("!antilink") && isGroup && isAdmin) {
      const option = args[0]?.toLowerCase();
      if (option === "on") {
        antiLinkGroups[from] = { enabled: true };
        fs.writeFileSync('./antilink.json', JSON.stringify(antiLinkGroups, null, 2));
        await sock.sendMessage(from, { text: "✅ Antilink enabled." }, { quoted: msg });
      } else if (option === "off") {
        delete antiLinkGroups[from];
        fs.writeFileSync('./antilink.json', JSON.stringify(antiLinkGroups, null, 2));
        await sock.sendMessage(from, { text: "❎ Antilink disabled." }, { quoted: msg });
      } else {
        const status = antiLinkGroups[from]?.enabled ? "✅ ON" : "❎ OFF";
        await sock.sendMessage(from, { text: `Antilink is currently: *${status}*` }, { quoted: msg });
      }
      return;
    }
    // Command Execution
    if (commandName && command) {
      try {
        await command.execute(sock, msg, args, from, sender, isGroup, groupMetadata, isAdmin);
      } catch (err) {
        console.error(`❌ Error in command "${commandName}":`, err);
      }
    }
  });
}

startBot();
