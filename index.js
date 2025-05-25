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
const handleAntiLink = require('./antilink');

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

sock.ev.on("messages.upsert", async ({ messages }) => {
  const msg = messages[0];
  if (!msg.message) return;

  const from = msg.key.remoteJid;
  const isGroup = from.endsWith("@g.us");
  const sender = msg.key.participant || msg.key.remoteJid;

  const body = msg.message?.conversation ||
              msg.message?.extendedTextMessage?.text ||
              msg.message?.imageMessage?.caption || "";
const prefix = "!";

const antilinkSettings = true;

// Helper function pata admins wa group
async function getGroupAdmins(sock, groupId) {
  try {
    const metadata = await sock.groupMetadata(groupId);
    return metadata.participants
      .filter(p => p.admin !== null)
      .map(p => p.id.split("@")[0]);
  } catch (err) {
    console.error("Error getting group admins:", err);
    return [];
  }
}

// Anti-link commands object
const antilinkCommands = {
  name: "antilink",
  description: "Manage Anti-link features to keep your group safe",
  emoji: "🚫",
  async execute(sock, msg, args, isGroup, groupAdmins, antilinkSettings) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderId = sender.split(":")[0];
    const isAdmin = groupAdmins.includes(senderId);

    if (!isGroup) {
      return sock.sendMessage(from, { text: "❌ *Anti-link commands work only in groups.*" });
    }
    if (!isAdmin) {
      return sock.sendMessage(from, { text: "⚠️ *You must be a group admin to use this command.*" });
    }
    if (args.length === 0) {
      return sock.sendMessage(from, {
        text: `❗*Usage:* 
${prefix}antilink on - Enable anti-link protection 🚫
${prefix}antilink off - Disable anti-link protection ❌
${prefix}antilink list - Show anti-link status 📋
${prefix}antilink reset - Reset anti-link settings 🔄
${prefix}antilink action remove - Auto-delete links ⛔
${prefix}antilink action kick - Auto-kick link posters 🚷
${prefix}antilink action mute - Auto-mute for 5 mins 🔇`
      });
    }

    const action = args[0].toLowerCase();

    switch (action) {
      case "on":
        antilinkSettings[from] = { enabled: true, actionRemove: true, actionKick: true, actionMute: false };
        await sock.sendMessage(from, { text: "✅ *Anti-link protection is now ENABLED!* 🚫" });
        break;

      case "off":
        antilinkSettings[from] = { enabled: false, actionRemove: false, actionKick: false, actionMute: false };
        await sock.sendMessage(from, { text: "❌ *Anti-link protection is now DISABLED!* ❌" });
        break;

      case "list":
        const status = antilinkSettings[from]?.enabled ? "ENABLED ✅" : "DISABLED ❌";
        const removeAction = antilinkSettings[from]?.actionRemove ? "ON ✅" : "OFF ❌";
        const kickAction = antilinkSettings[from]?.actionKick ? "ON ✅" : "OFF ❌";
        const muteAction = antilinkSettings[from]?.actionMute ? "ON ✅" : "OFF ❌";
        await sock.sendMessage(from, {
          text: `📋 *Anti-link Status:* 
Protection: *${status}* 
Remove Links: *${removeAction}* 
Kick Offenders: *${kickAction}* 
Mute Offenders: *${muteAction}*`
        });
        break;

      case "reset":
        delete antilinkSettings[from];
        await sock.sendMessage(from, { text: "♻️ *Anti-link settings have been RESET!* 🔄" });
        break;

      case "action":
        if (!antilinkSettings[from]?.enabled) {
          return sock.sendMessage(from, { text: "⚠️ *Enable anti-link first using:* `antilink on`" });
        }
        switch (args[1]?.toLowerCase()) {
          case "remove":
            antilinkSettings[from].actionRemove = true;
            await sock.sendMessage(from, { text: "⛔ *Auto-Remove is ON!* Links will be deleted." });
            break;

          case "kick":
            antilinkSettings[from].actionKick = true;
            await sock.sendMessage(from, { text: "🚷 *Auto-KICK is ON!* Users will be removed." });
            break;

          case "mute":
            antilinkSettings[from].actionMute = true;
            await sock.sendMessage(from, { text: "🔇 *Auto-MUTE is ON!* Offenders will be muted for 5 minutes." });
            break;

          default:
            await sock.sendMessage(from, { text: "❓ *Invalid action. Use:* `remove`, `kick`, `mute`" });
        }
        break;

      default:
        await sock.sendMessage(from, { text: "❓ *Invalid option. Use on/off/list/reset/action remove/kick/mute*" });
    }
  },
};

// Anti-link check for incoming messages
async function antiLinkCheck(sock, message, antilinkSettings, groupAdmins) {
  const from = message.key.remoteJid;
  if (!antilinkSettings[from]?.enabled) return;

  const sender = message.key.participant || message.key.remoteJid;
  const senderId = sender.split(":")[0];
  const isAdmin = groupAdmins.includes(senderId);

  // Extract text from message
  const textMsg =
    message.message?.conversation ||
    message.message?.extendedTextMessage?.text ||
    message.message?.imageMessage?.caption ||
    message.message?.videoMessage?.caption ||
    "";

  const linkRegex = /https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+/gi;

  if (linkRegex.test(textMsg) && !isAdmin) {
    try {
      await sock.sendMessage(from, {
        text: `⚠️ @${senderId}, posting group links is *NOT allowed*!`,
        mentions: [sender],
      });

      if (antilinkSettings[from].actionRemove) {
        await sock.sendMessage(from, { delete: message.key });
      }
      if (antilinkSettings[from].actionKick) {
        await sock.groupParticipantsUpdate(from, [sender], "remove");
      }
      if (antilinkSettings[from].actionMute) {
        // NOTE: Baileys API doesn't directly support mute, so you may need to implement mute differently or skip
        // This is a placeholder if your bot supports muting via groupParticipantsUpdate or other method
        // Remove or comment if unsupported
        // await sock.groupParticipantsUpdate(from, [{ participant: sender, muting: { mute: true, duration: 5 * 60 * 1000 } }]);
        await sock.sendMessage(from, {
          text: `🔇 @${senderId} would be muted for 5 minutes (functionality depends on your bot's capabilities).`,
          mentions: [sender],
        });
      }
    } catch (err) {
      console.error("Anti-link punishment error:", err);
    }
  }
}

// Example message listener with command handling (inside your sock event)
sock.ev.on("messages.upsert", async ({ messages }) => {
  for (const msg of messages) {
    if (!msg.message || msg.key.fromMe) continue;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderId = sender.split(":")[0];

    // Get group admins if group
    let groupAdmins = [];
    if (isGroup) {
      groupAdmins = await getGroupAdmins(sock, from);
    }

    // Run anti-link check on every message
    await antiLinkCheck(sock, msg, antilinkSettings, groupAdmins);

    // Extract text command
    let body = "";
    if (msg.message.conversation) {
      body = msg.message.conversation;
    } else if (msg.message.extendedTextMessage?.text) {
      body = msg.message.extendedTextMessage.text;
    } else {
      body = "";
    }

    if (!body.startsWith(prefix)) continue;

    const args = body.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Handle antilink command
    if (command === "antilink") {
      await antilinkCommands.execute(sock, msg, args, isGroup, groupAdmins, antilinkSettings);
    }

    // ... hapa weka command handlers zako nyingine
  }
});




  
//==== AUTO OPEN VIEW ONCE MESSAGE ====
  if (AUTO_VIEW_ONCE) {
    try {
      // Check if message has viewOnceMessage
      const viewOnceMsg = msg.message?.viewOnceMessage;
      if (viewOnceMsg) {
        // For groups, check if sender is admin
        if (!isGroup || (await isUserAdmin(sock, from, sender))) {
          // Resend the message content without viewOnce restriction
          const originalMsg = viewOnceMsg.message;
          await sock.sendMessage(from, originalMsg, { quoted: msg });
          console.log(`✅ Auto opened viewOnce message from ${sender} in ${from}`);
        }
      }
    } catch (err) {
      console.error("❌ Error auto-opening viewOnce message:", err);
    }
  }

  // ==== AUTO VIEW STATUS AND REACT ====
  if (AUTO_VIEW_STATUS) {
    try {
      // When user sends a status (story), it arrives as a message with protocolMessage of type 'status'
      const protocolMsg = msg.message?.protocolMessage;
      if (protocolMsg && protocolMsg.type === 5) { // 5 means status update
        const statusOwner = protocolMsg.key.participant || protocolMsg.key.remoteJid;

        // Mark status as viewed
        await sock.sendReadReceipt(from, statusOwner, [protocolMsg.key.id]);

        // React with emojis 💝....🚀....😁...👌
        await sock.sendMessage(from, {
          react: {
            text: "💝",
            key: protocolMsg.key,
          }
        });

        await sock.sendMessage(from, {
          react: {
            text: "🚀",
            key: protocolMsg.key,
          }
        });

        await sock.sendMessage(from, {
          react: {
            text: "😁",
            key: protocolMsg.key,
          }
        });

        await sock.sendMessage(from, {
          react: {
            text: "👌",
            key: protocolMsg.key,
          }
        });

        console.log(`✅ Auto viewed and reacted to status from ${statusOwner}`);
      }
    } catch (err) {
      console.error("❌ Error auto-viewing/reacting status:", err);
    }
  }

    if (AUTO_TYPING) {
      await sock.sendPresenceUpdate('composing', from);
      setTimeout(() => {
        sock.sendPresenceUpdate('paused', from);
      }, 3000);
      await sock.sendPresenceUpdate("recording", from);
      setTimeout(() => {
        sock.sendPresenceUpdate("available", from);
      }, 5000);
    }

    if (from.endsWith("@g.us") && body.includes("https://chat.whatsapp.com/")) {
      try {
        const groupMetadata = await sock.groupMetadata(from);
        const isAdmin = groupMetadata.participants.find(p => p.id === sender && (p.admin === "admin" || p.admin === "superadmin"));
        const botAdmin = groupMetadata.participants.find(p => p.id === sock.user.id && (p.admin === "admin" || p.admin === "superadmin"));

        if (botAdmin) {
          if (isAdmin) {
            await sock.sendMessage(from, { text: `⚠️ Admin @${sender.split("@")[0]} posted a group link. Skipping remove.`, mentions: [sender] });
          } else {
            await sock.sendMessage(from, { text: `🚫 Link detected! Removing @${sender.split("@")[0]}...`, mentions: [sender] });
            await sock.groupParticipantsUpdate(from, [sender], "remove");
          }
        } else {
          warnedUsers[sender] = (warnedUsers[sender] || 0) + 1;
          await sock.sendMessage(from, { text: `⚠️ @${sender.split("@")[0]}, stop posting links. Warn: ${warnedUsers[sender]}`, mentions: [sender] });
        }
      } catch (e) {
        console.error("Antilink error:", e);
      }
    }

    // Command Execution
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
