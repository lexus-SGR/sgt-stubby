const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Fatuma WhatsApp Bot is running!"));
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port " + (process.env.PORT || 3000));
});

require('events').EventEmitter.defaultMaxListeners = 100;

const OWNER_JID = "255760317060@s.whatsapp.net"; // Owner number
const antiLinkGroups = {};
const antiFakeGroups = {};
const autoViewStatus = true;
const autoViewOnce = true;

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const P = require("pino");
const axios = require("axios");
const cheerio = require("cheerio");
const { Boom } = require("@hapi/boom");
const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

const PREFIX = "!";

const emojiReactions = ["❤️", "😂", "🔥", "👍", "😎", "🤖"];
const randomEmoji = () => emojiReactions[Math.floor(Math.random() * emojiReactions.length)];

// Function ya auto view status
async function onViewStatus(sock, jid, from) {
  try {
    await sock.sendMessage(jid, { react: { text: "🚀", key: { remoteJid: jid } } });

    const ownerJid = "255760317060@s.whatsapp.net"; // Badilisha namba yako hapa kama unataka
    const userNumber = from.replace("@s.whatsapp.net", "");
    const dmMessage = `🇹🇿 *Seen by Ben owner of this bot (SPD-XMD)* 🇹🇿\nUser: +${userNumber}`;

    await sock.sendMessage(ownerJid, { text: dmMessage });
  } catch (err) {
    console.error("Error in onViewStatus:", err);
  }
}

// Function ya kubadilisha bio automatically
function autoBio(sock) {
  const bios = [
    "🚀 SPD-XMD Bot - Your AI Companion",
    "🤖 Powered by AI & Tech Tools",
    "📈 Uptime Stable & Running Smoothly",
    "🎯 Helping You Every Step of The Way",
    "🔧 Custom Tools & Downloads",
    "🌍 Made for Tanzania & Beyond"
  ];

  let index = 0;

  setInterval(async () => {
    try {
      const newBio = bios[index];
      await sock.updateProfileStatus(newBio);
      console.log(`Auto bio updated to: ${newBio}`);

      index = (index + 1) % bios.length;
    } catch (err) {
      console.error("Error updating bio:", err);
    }
  }, 6 * 60 * 60 * 1000); // kila baada ya masaa 6
}

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

// Show QR manually if needed
sock.ev.on("connection.update", (update) => {
  const { qr } = update;
  if (qr) {
    const qrcode = require("qrcode-terminal");
    qrcode.generate(qr, { small: true });
  }
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

      await sock.sendMessage(OWNER_JID, {
        text: menu
      });
    }
  });

  // Load commands from commands/
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

let isGroupAdmin = false;
let isBotAdmin = false;

if (isGroup) {
  try {
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants || [];

    const senderData = participants.find(p => p.id === sender);
    const botData = participants.find(p => p.id === sock.user.id.split(":")[0] + "@s.whatsapp.net");

    isGroupAdmin = senderData?.admin !== null && senderData?.admin !== undefined;
    isBotAdmin = botData?.admin !== null && botData?.admin !== undefined;
  } catch (e) {
    console.error("Group admin check failed:", e);
  }
}

  // Hapa unaweza check amri za bot zako:
  if (body.toLowerCase() === `${PREFIX}viewstatus`) {
    await onViewStatus(sock, from, sender);
  }

  if (!isGroup && body.toLowerCase() === `${PREFIX}startbio`) {
    autoBio(sock);
  }

    
    // FAKE RECORDING PRESENCE
    await sock.sendPresenceUpdate("recording", from);
    setTimeout(() => {
      sock.sendPresenceUpdate("available", from);
    }, 5000);

sock.ev.on("message-status.update", async (status) => {
  if (!autoViewStatus) return;
  try {
    const jid = status.key.remoteJid;
    if (jid?.includes("status@broadcast")) {
      await sock.readMessages([status.key]);

      // Add emoji reaction after viewing status
      await sock.sendMessage(jid, {
        react: {
          text: "👀", // Emoji reaction
          key: status.key,
        },
      });
    }
  } catch (e) {
    console.error("Auto View Status Error:", e);
  }
});
sock.ev.on("group-participants.update", async (update) => {
  try {
    if (!antiFakeGroups[update.id]) return;

    for (let user of update.participants) {
      if (user.startsWith("255")) continue;
      const metadata = await sock.groupMetadata(update.id);
      const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";
      const botAdmin = metadata.participants.find(p => p.id === botNumber)?.admin;

      if (botAdmin) {
        await sock.sendMessage(update.id, {
          text: `❌ *@${user.split("@")[0]}* removed (not +255 number)`,
          mentions: [user]
        });
        await sock.groupParticipantsUpdate(update.id, [user], "remove");
      }
    }
  } catch (err) {
    console.error("AntiFake Error:", err);
  }
});

// Enable Anti-Fake Command
if (isGroup && body.startsWith(PREFIX + "antifake")) {
  if (!isGroupAdmin && sender !== OWNER_JID) return sock.sendMessage(from, { text: "⚠️ Admins only!" });
  const arg = body.split(" ")[1];
  if (arg === "on") {
    antiFakeGroups[from] = true;
    await sock.sendMessage(from, { text: "✅ Anti-Fake enabled" });
  } else if (arg === "off") {
    delete antiFakeGroups[from];
    await sock.sendMessage(from, { text: "❌ Anti-Fake disabled" });
  } else {
    await sock.sendMessage(from, { text: "Usage: antifake on/off" });
  }
}
sock.ev.on("messages.delete", async (del) => {
  try {
    const msg = del.messages[0];
    if (!msg || msg.key.fromMe) return;
    const participant = msg.key.participant || msg.key.remoteJid;
    await sock.sendMessage(msg.key.remoteJid, {
      text: `🗑️ *Deleted Message From @${participant.split("@")[0]}*:`,
      mentions: [participant]
    });
    await sock.sendMessage(msg.key.remoteJid, msg.message);
  } catch (e) {
    console.error("AntiDelete Error:", e);
  }
});
// In-memory settings: group JID -> boolean (true=antilink on)
const antilinkSettings = {};

// Command to toggle AntiLink per group
async function handleAntiLinkToggleCommand(message) {
  const { key, message: msgObj } = message;
  const from = key.remoteJid;
  const sender = key.participant || key.remoteJid;
  const text = msgObj?.conversation || msgObj?.extendedTextMessage?.text || "";

  // Only in groups
  if (!from.endsWith("@g.us")) return;

  // Check if sender is admin
  const groupMetadata = await sock.groupMetadata(from);
  const isSenderAdmin = groupMetadata.participants.some(
    (p) => p.id === sender && (p.admin === "admin" || p.admin === "superadmin")
  );

  if (!isSenderAdmin) {
    await sock.sendMessage(from, {
      text: "❌ Only group admins can toggle AntiLink.",
      mentions: [sender],
    }, { quoted: message });
    return;
  }

  const args = text.trim().split(" ");
  if (args.length < 2) return; // command should be like "!antilink on" or "!antilink off"

  const option = args[1].toLowerCase();
  if (option === "on") {
    antilinkSettings[from] = true;
    await sock.sendMessage(from, {
      text: "✅ AntiLink has been enabled for this group.",
    }, { quoted: message });
  } else if (option === "off") {
    antilinkSettings[from] = false;
    await sock.sendMessage(from, {
      text: "⚠️ AntiLink has been disabled for this group.",
    }, { quoted: message });
  } else {
    await sock.sendMessage(from, {
      text: "❌ Invalid option. Use `!antilink on` or `!antilink off`.",
    }, { quoted: message });
  }
}

// Modified AntiLink handler with on/off check
async function handleAntiLink(message) {
  try {
    const { key, message: msgObj } = message;
    const from = key.remoteJid;
    const sender = key.participant || key.remoteJid;
    const text = msgObj?.conversation || msgObj?.extendedTextMessage?.text || "";

    if (!from.endsWith("@g.us")) return;

    // Check if AntiLink is enabled for this group
    if (!antilinkSettings[from]) return;

    const linkRegex = /(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|chat\.whatsapp\.com|t\.me|telegram\.me|instagram\.com|twitter\.com|facebook\.com|youtu\.be|youtube\.com|bit\.ly|tinyurl\.com|goo\.gl|https?:\/\/[^\s]+)/gi;

    if (!linkRegex.test(text)) return;

    const groupMetadata = await sock.groupMetadata(from);
    const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    const isBotAdmin = groupMetadata.participants.some(
      (p) => p.id === botNumber && (p.admin === "admin" || p.admin === "superadmin")
    );
    const isSenderAdmin = groupMetadata.participants.some(
      (p) => p.id === sender && (p.admin === "admin" || p.admin === "superadmin")
    );

    if (isSenderAdmin) return;

    if (!isBotAdmin) {
      await sock.sendMessage(from, {
        text: `⚠️ @${sender.split("@")[0]}, I detected a link but I am not admin, so I can't remove you.`,
        mentions: [sender],
      }, { quoted: message });
      await sock.sendMessage(from, { react: { text: "❌", key: message.key } });
      return;
    }

    await sock.groupParticipantsUpdate(from, [sender], "remove");
    await sock.sendMessage(from, {
      text: `🚫 Anti-Link Alert!\n@${sender.split("@")[0]} sent a link and has been removed.`,
      mentions: [sender],
    }, { quoted: message });
    await sock.sendMessage(from, { react: { text: "🚷", key: message.key } });
  } catch (error) {
    console.error("AntiLink error:", error);
  }
}

// In your messages.upsert event listener
sock.ev.on("messages.upsert", async ({ messages, type }) => {
  if (type !== "notify") return;

  for (const message of messages) {
    if (!message.message) continue;

    const text =
      message.message.conversation ||
      message.message.extendedTextMessage?.text ||
      "";

    if (text?.toLowerCase().startsWith("!antilink ")) {
      await handleAntiLinkToggleCommand(message);
      continue;
    }

    // Check AntiLink on normal messages
    await handleAntiLink(message);

    // Your other handlers here...
  }
});


// Auto Open ViewOnce in groups where bot is admin
if (autoViewOnce && msg.type === "notify") {
  for (const msg of msg.messages) {
    if (!msg.message || !msg.key || msg.key.fromMe) continue;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");

    if (isGroup && msg.message?.viewOnceMessageV2) {
      try {
        const metadata = await sock.groupMetadata(from);
        const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        const botData = metadata.participants.find(p => p.id === botNumber);
        const isBotAdmin = botData?.admin !== null && botData?.admin !== undefined;

        if (!isBotAdmin) continue; // Skip if bot is not admin

        const message = msg.message.viewOnceMessageV2.message;

        // Forward the message content back to the group
        await sock.sendMessage(from, { forward: msg, text: "👀 ViewOnce message opened!" });

      } catch (err) {
        console.error("Auto ViewOnce Error:", err);
      }
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
