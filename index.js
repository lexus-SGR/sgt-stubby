require('events').EventEmitter.defaultMaxListeners = 100;

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

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const sender = msg.key.participant || msg.key.remoteJid;
    const body = msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                msg.message?.imageMessage?.caption || "";

    async function isUserAdmin(sock, groupId, userId) {
  try {
    const metadata = await sock.groupMetadata(groupId);
    const participant = metadata.participants.find(p => p.id === userId);
    return participant && (participant.admin === "admin" || participant.admin === "superadmin");
  } catch {
    return false;
  }
}
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
