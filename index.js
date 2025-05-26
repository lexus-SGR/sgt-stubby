require('events').EventEmitter.defaultMaxListeners = 100;
require("dotenv").config();
const express = require("express");
const welcomeGroups = new Set();
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

// App config
const app = express();
app.get("/", (req, res) => res.send("Fatuma WhatsApp Bot is running!"));
app.listen(process.env.PORT || 3000, () =>
  console.log("Server running on port " + (process.env.PORT || 3000))
);

// Env Configs
const OWNER_NUMBER = process.env.OWNER_NUMBER;
const OWNER_JID = OWNER_NUMBER + "@s.whatsapp.net";
const PREFIX = "!";
const AUTO_BIO = true;
const AUTO_VIEW_ONCE = process.env.AUTO_VIEW_ONCE === "on";
const ANTILINK_ENABLED = process.env.ANTILINK === "on";
const AUTO_TYPING = process.env.AUTO_TYPING === "on";
const RECORD_VOICE_FAKE = process.env.RECORD_VOICE_FAKE === "off";
const AUTO_VIEW_STATUS = process.env.AUTO_VIEW_STATUS === "on";
const AUTO_REACT_EMOJI = process.env.AUTO_REACT_EMOJI || "";

// Load Antilink settings
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
✅ *Bot Connected Successfully!*
👑 *Owner:* @${OWNER_NUMBER}
ℹ️ Type *${PREFIX}menu* or *${PREFIX}help* for commands.
      `;
      await sock.sendMessage(OWNER_JID, { text: welcomeText, mentions: [OWNER_JID] });

      if (AUTO_BIO) {
        const dateStr = new Date().toLocaleDateString('en-GB');
        const quotes = [
          "Learning never exhausts the mind.",
          "Laughter is timeless, imagination has no age.",
          "The best way to predict the future is to create it.",
          "Education is the most powerful weapon.",
          "Entertainment is the spark of learning!"
        ];
        const newBio = `👑 Ben Whittaker | 👤 Fatuma | 📅 ${dateStr} | ✨ ${quotes[Math.floor(Math.random() * quotes.length)]}`;
        try {
          await sock.updateProfileStatus(newBio);
        } catch (e) {
          console.error("❌ Failed to update bio:", e.message);
        }
      }
    }
  });

sock.ev.on('group-participants.update', async (update) => {
    const groupId = update.id;
    if (welcomeGroups.has(groupId)) {
      for (const participant of update.participants) {
        if (update.action === 'add') {
          try {
            const groupMetadata = await sock.groupMetadata(groupId);
            const groupName = groupMetadata.subject;

            const welcomeText = `👋 Hello @${participant.split('@')[0]}!\n\nWelcome to *${groupName}*.\nWe're glad to have you here. Please introduce yourself and follow the rules.`;

            await sock.sendMessage(groupId, {
              text: welcomeText,
              mentions: [participant]
            });
          } catch (e) {
            console.error("❌ Error sending welcome message:", e.message);
          }
        }
      }
    }
  });
  
  // Load commands
  const commands = new Map();
  const commandsPath = path.join(__dirname, "commands");
  if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);

  fs.readdirSync(commandsPath).filter(f => f.endsWith(".js")).forEach(file => {
    const cmd = require(path.join(commandsPath, file));
    if (cmd.name) commands.set(cmd.name.toLowerCase(), cmd);
  });

  // Handle messages
  sock.ev.on("messages.upsert", async ({ messages }) => {
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

    let groupMetadata = {}, isAdmin = false, botIsAdmin = false;
    if (isGroup) {
      groupMetadata = await sock.groupMetadata(from);
      isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin != null;
      const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
      botIsAdmin = groupMetadata.participants.find(p => p.id === botJid)?.admin != null;
    }

    if (AUTO_TYPING) await sock.sendPresenceUpdate('composing', from);
    if (RECORD_VOICE_FAKE) await sock.sendPresenceUpdate('recording', from);
    if (AUTO_REACT_EMOJI) {
      await sock.sendMessage(from, {
        react: { text: AUTO_REACT_EMOJI, key: msg.key }
      });
    }

    //View Once auto open
      if (AUTO_VIEW_ONCE) {
        await handleViewOnceMessage(msg);
      }

// Antilink
if (ANTILINK_ENABLED && isGroup && antiLinkGroups[from]?.enabled) {
  if (body.includes("https://chat.whatsapp.com")) {
    if (!isAdmin && botIsAdmin) {
      try {
        // Delete the message with the link
        await sock.sendMessage(from, {
          delete: msg.key
        });

        // Send warning message first
        await sock.sendMessage(from, {
          text: `⚠️ @${sender.split("@")[0]}, you shared a forbidden link.\nYou will be removed from the group shortly.`,
          mentions: [sender]
        });

        // Wait 5 seconds before removing
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Remove user from group
        await sock.groupParticipantsUpdate(from, [sender], "remove");

        // Notify group of removal
        await sock.sendMessage(from, {
          text: `✅ @${sender.split("@")[0]} has been removed for sharing a forbidden link.`,
          mentions: [sender]
        });
      } catch (e) {
        console.error("❌ Error handling antilink:", e);
      }
    }
  }
}
    // Antilink Command
    if (body.startsWith("!antilink") && isAdmin) {
      const option = args[0]?.toLowerCase();
      if (option === "on") {
        antiLinkGroups[from] = { enabled: true };
        fs.writeFileSync('./antilink.json', JSON.stringify(antiLinkGroups, null, 2));
        await sock.sendMessage(from, { text: "✅ Antilink enabled." });
      } else if (option === "off") {
        delete antiLinkGroups[from];
        fs.writeFileSync('./antilink.json', JSON.stringify(antiLinkGroups, null, 2));
        await sock.sendMessage(from, { text: "❎ Antilink disabled." });
      } else {
        const status = antiLinkGroups[from]?.enabled ? "✅ ON" : "❎ OFF";
        await sock.sendMessage(from, { text: `Antilink is: *${status}*` });
      }
      return;
    }
// Welcome Command
    if (body === '!welcome') {
      if (!isGroup) {
        await sock.sendMessage(from, { text: "❌ This command is for groups only." }, { quoted: msg });
        return;
      }
      if (!isAdmin) {
        await sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: msg });
        return;
      }

      if (welcomeGroups.has(from)) {
        welcomeGroups.delete(from);
        await sock.sendMessage(from, { text: "👋 Welcome messages have been *disabled*." }, { quoted: msg });
      } else {
        welcomeGroups.add(from);
        await sock.sendMessage(from, { text: "✅ Welcome messages have been *enabled*. New members will now get a welcome message." }, { quoted: msg });
      }
      return;
    }


    
    // Run command
    if (commandName && command) {
      try {
        await command.execute(sock, msg, args, from, sender, isGroup, groupMetadata, isAdmin);
      } catch (err) {
        console.error(`❌ Error in command "${commandName}":`, err);
      }
    }
  });

  // View Once auto open helper
async function handleViewOnceMessage(msg) {
  const viewOnceMessage = msg.message?.viewOnceMessage?.message;
  if (viewOnceMessage) {
    const mediaType = Object.keys(viewOnceMessage)[0];
    await sock.readMessages([msg.key]);
    await sock.sendMessage(msg.key.remoteJid, { [mediaType]: viewOnceMessage[mediaType] }, { quoted: msg });
  }
}

  // Auto view status updates
    const viewOnceMessage = msg.message?.viewOnceMessage?.message;
    if (viewOnceMessage && AUTO_VIEW_ONCE) {
      const mediaType = Object.keys(viewOnceMessage)[0];
      await sock.readMessages([msg.key]);
      await sock.sendMessage(msg.key.remoteJid, { [mediaType]: viewOnceMessage[mediaType] }, { quoted: msg });
    }

    // Auto view status
    if (msg.key.remoteJid === 'status@broadcast' && AUTO_VIEW_STATUS) {
      try {
        await sock.readMessages([msg.key]);
        console.log(`👀 Auto-viewed status from ${msg.pushName || msg.key.participant}`);
      } catch (err) {
        console.error('❌ Failed to auto-view status:', err.message);
      }
    }
  }
});

  }
}

startBot();
