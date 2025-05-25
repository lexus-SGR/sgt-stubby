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
Listen for incoming messages
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const sender = msg.key.participant || msg.key.remoteJid;
    const body = msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                msg.message?.imageMessage?.caption || "";

    // FAKE RECORDING PRESENCE
    await sock.sendPresenceUpdate("recording", from);
    setTimeout(() => {
      sock.sendPresenceUpdate("available", from);
    }, 10000);

    // ANTI-LINK FEATURE
    if (isGroup && body.toLowerCase().startsWith(PREFIX + "antlink")) {
      const args = body.trim().split(" ");
      const sub = args[1]?.toLowerCase();
      const option = args[2]?.toLowerCase();
      antiLinkGroups[from] = antiLinkGroups[from] || { enabled: false, action: "remove" };

      if (sub === "on") {
        antiLinkGroups[from].enabled = true;
        await sock.sendMessage(from, {
          text: "✅ Anti-Link is now *ON*.",
          react: { text: "🛡️", key: msg.key }
        });
      } else if (sub === "off") {
        antiLinkGroups[from].enabled = false;
        await sock.sendMessage(from, {
          text: "❌ Anti-Link is now *OFF*.",
          react: { text: "🚫", key: msg.key }
        });
      } else if (sub === "action" && ["remove", "warn"].includes(option)) {
        antiLinkGroups[from].action = option;
        await sock.sendMessage(from, {
          text: `⚙️ Action set to *${option}*`,
          react: { text: "⚠️", key: msg.key }
        });
      } else {
        await sock.sendMessage(from, {
          text: `🛡️ Use:\n${PREFIX}antlink on\n${PREFIX}antlink off\n${PREFIX}antlink action remove|warn`,
          react: { text: "ℹ️", key: msg.key }
        });
      }
    }

    if (isGroup && antiLinkGroups[from]?.enabled) {
      const linkRegex = /https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/;
      const action = antiLinkGroups[from].action;

      if (linkRegex.test(body) && sender !== OWNER_JID) {
        try {
          const metadata = await sock.groupMetadata(from);
          const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";
          const botAdmin = metadata.participants.find(p => p.id === botNumber)?.admin;

          if (!botAdmin) {
            await sock.sendMessage(from, {
              text: "⚠️ I'm not admin, can't perform action."
            });
            return;
          }

          if (action === "warn") {
            await sock.sendMessage(from, {
              text: `⚠️ *@${sender.split("@")[0]}*, link sharing not allowed!`,
              mentions: [sender]
            });
          } else if (action === "remove") {
            await sock.sendMessage(from, {
              text: `🚫 *@${sender.split("@")[0]}* removed for sharing link.`,
              mentions: [sender]
            });
            await sock.groupParticipantsUpdate(from, [sender], "remove");
          }
        } catch (err) {
          console.error("Anti-Link Error:", err);
        }
      }
    }

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
