require('events').EventEmitter.defaultMaxListeners = 100;
require("dotenv").config();
const express = require("express");
const welcomeGroups = new Set();
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

// BRAND NAME
const BRAND = "🤖 *Ben Whittaker Tech*";

// App config
const app = express();
app.get("/", (req, res) => res.send(`${BRAND} is running!`));
app.listen(process.env.PORT || 3000, () =>
  console.log(`Server running on port ${process.env.PORT || 3000}`)
);

// Env Configs
const OWNER_NUMBER = process.env.OWNER_NUMBER || "255760317060";
const OWNER_JID = OWNER_NUMBER + "@s.whatsapp.net";
const PREFIX = "!";
const AUTO_BIO = true;
const AUTO_VIEW_ONCE = process.env.AUTO_VIEW_ONCE === "on";
const ANTILINK_ENABLED = process.env.ANTILINK === "on";
const AUTO_TYPING = process.env.AUTO_TYPING === "on";
const RECORD_VOICE_FAKE = process.env.RECORD_VOICE_FAKE === "on";
const AUTO_VIEW_STATUS = process.env.AUTO_VIEW_STATUS === "on";
const AUTO_REACT_EMOJI = process.env.AUTO_REACT_EMOJI || "";

// Allowed users (load from file)
let allowedUsers = {};
try {
  allowedUsers = JSON.parse(fs.readFileSync('allowed.json'));
} catch {
  fs.writeFileSync('allowed.json', '{}');
}

// Load Antilink settings
let antiLinkGroups = {};
try {
  antiLinkGroups = JSON.parse(fs.readFileSync('antilink.json'));
} catch {
  fs.writeFileSync('antilink.json', '{}');
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
🔰 *WELCOME TO ${BRAND}* 🔰
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
        const newBio = `👑 Ben Whittaker | 📅 ${dateStr} | ✨ ${quotes[Math.floor(Math.random() * quotes.length)]} | ${BRAND}`;
        try {
          await sock.updateProfileStatus(newBio);
        } catch (e) {
          console.error("❌ Failed to update bio:", e.message);
        }
      }
    }
  });

  // Welcome message with group picture and member count
  sock.ev.on('group-participants.update', async (update) => {
    const groupId = update.id;
    if (!welcomeGroups.has(groupId)) return;
    try {
      const groupMetadata = await sock.groupMetadata(groupId);
      const oldCount = groupMetadata.participants.length - update.participants.length;
      const newCount = groupMetadata.participants.length;
      const groupName = groupMetadata.subject;

      for (const participant of update.participants) {
        if (update.action === 'add') {
          let pfpUrl = "";
          try {
            pfpUrl = await sock.profilePictureUrl(groupId, "image");
          } catch {
            pfpUrl = "https://i.ibb.co/4pDNDk1/Group-Placeholder.png"; // default if no picture
          }

          const welcomeText = `👋 Hello @${participant.split('@')[0]}!\n\n` +
            `Welcome to *${groupName}*.\n` +
            `👥 Members before you joined: ${oldCount}\n` +
            `➕ New total members: ${newCount}\n\n` +
            `Please follow the group rules.\n\n` +
            `${BRAND}`;

          await sock.sendMessage(groupId, {
            image: { url: pfpUrl },
            caption: welcomeText,
            mentions: [participant]
          });
        }
      }
    } catch (e) {
      console.error("❌ Error sending welcome message:", e.message);
    }
  });

  // Load commands
  const commands = new Map();
  const commandsPath = path.join(__dirname, "commands");
  if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);
  fs.readdirSync(commandsPath).filter(f => f.endsWith(".js")).forEach(file => {
    try {
      const cmd = require(path.join(commandsPath, file));
      if (cmd.name) commands.set(cmd.name.toLowerCase(), cmd);
    } catch (e) {
      console.error(`❌ Failed to load command ${file}:`, e);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const sender = msg.key.participant || msg.key.remoteJid;
    const number = sender.split("@")[0];

    const body = msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption || "";

    const commandName = body.startsWith(PREFIX)
      ? body.slice(PREFIX.length).split(/\s+/)[0].toLowerCase()
      : null;

    const args = body.trim().split(/\s+/).slice(1);
    const command = commands.get(commandName);

    // Owner can allow users
    if (body.startsWith(`${PREFIX}allow`) && number === OWNER_NUMBER) {
      const target = args[0];
      if (!target || !/^\d{9,15}$/.test(target)) {
        return await sock.sendMessage(from, { text: `❌ Usage: ${PREFIX}allow 2557XXXXXXXX` });
      }
      allowedUsers[target] = true;
      fs.writeFileSync('allowed.json', JSON.stringify(allowedUsers, null, 2));
      return await sock.sendMessage(from, { text: `✅ ${target} is now allowed to use the bot.` });
    }

    // Permission check
    const isAllowed = number === OWNER_NUMBER || allowedUsers[number];
    if (!isAllowed && command) {
      return await sock.sendMessage(from, {
        text: `❌ You are not allowed to use this bot.\nAsk owner to allow you with: *${PREFIX}allow YOUR_NUMBER*`
      });
    }

    // Read message (auto seen)
    await sock.readMessages([msg.key]);

    // Auto typing and recording presence
    if (AUTO_TYPING) await sock.sendPresenceUpdate('composing', from);
    if (RECORD_VOICE_FAKE) await sock.sendPresenceUpdate('recording', from);

    // Auto react emoji if set
    if (AUTO_REACT_EMOJI) {
      await sock.sendMessage(from, {
        react: { text: AUTO_REACT_EMOJI, key: msg.key }
      });
    }

    // Auto open view once messages
    if (AUTO_VIEW_ONCE && msg.message.viewOnceMessage) {
      try {
        const viewOnceMsg = msg.message.viewOnceMessage.message;
        const mediaType = Object.keys(viewOnceMsg)[0];
        await sock.sendMessage(from, { [mediaType]: viewOnceMsg[mediaType] }, { quoted: msg });
      } catch (e) {
        console.error("❌ Error opening view once message:", e);
      }
    }

    // Antilink enforcement
    if (ANTILINK_ENABLED && isGroup && antiLinkGroups[from]?.enabled) {
      if (body.includes("https://chat.whatsapp.com")) {
        const groupMetadata = await sock.groupMetadata(from);
        const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin != null;
        const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        const botIsAdmin = groupMetadata.participants.find(p => p.id === botJid)?.admin != null;

        if (!isAdmin && botIsAdmin) {
          try {
            await sock.sendMessage(from, { delete: msg.key });
            await sock.sendMessage(from, {
              text: `⚠️ @${number}, you shared a forbidden link and will be removed.\n${BRAND}`,
              mentions: [sender]
            });
            await new Promise(r => setTimeout(r, 5000));
            await sock.groupParticipantsUpdate(from, [sender], "remove");
            await sock.sendMessage(from, {
              text: `✅ @${number} was removed for sharing forbidden links.\n${BRAND}`,
              mentions: [sender]
            });
          } catch (e) {
            console.error("❌ Error handling antilink:", e);
          }
        }
      }
    }

    // Antilink toggle command (admins only)
    if (commandName === "antilink" && isGroup) {
      const groupMetadata = await sock.groupMetadata(from);
      const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin != null;
      if (!isAdmin) return;

      const option = args[0]?.toLowerCase();
      if (option === "on") {
        antiLinkGroups[from] = { enabled: true };
        fs.writeFileSync('antilink.json', JSON.stringify(antiLinkGroups, null, 2));
        await sock.sendMessage(from, { text: `✅ Antilink enabled.\n${BRAND}` });
      } else if (option === "off") {
        delete antiLinkGroups[from];
        fs.writeFileSync('antilink.json', JSON.stringify(antiLinkGroups, null, 2));
        await sock.sendMessage(from, { text: `❎ Antilink disabled.\n${BRAND}` });
      } else {
        const status = antiLinkGroups[from]?.enabled ? "✅ ON" : "❎ OFF";
        await sock.sendMessage(from, { text: `Antilink is: *${status}*\n${BRAND}` });
      }
      return;
    }

    // Welcome toggle command (group admins only)
    if (commandName === "welcome") {
      if (!isGroup) {
        await sock.sendMessage(from, { text: `❌ This command is for groups only.\n${BRAND}` }, { quoted: msg });
        return;
      }
      const groupMetadata = await sock.groupMetadata(from);
      const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin != null;
      if (!isAdmin) {
        await sock.sendMessage(from, { text: `❌ Only admins can use this command.\n${BRAND}` }, { quoted: msg });
        return;
      }

      if (welcomeGroups.has(from)) {
        welcomeGroups.delete(from);
        await sock.sendMessage(from, { text: `👋 Welcome messages have been *disabled*.\n${BRAND}` }, { quoted: msg });
      } else {
        welcomeGroups.add(from);
        await sock.sendMessage(from, { text: `✅ Welcome messages have been *enabled*. New members will now get a welcome message.\n${BRAND}` }, { quoted: msg });
      }
      return;
    }

    // Execute command if found and allowed
    if (commandName && command) {
      try {
        await command.execute(sock, msg, args, from, sender, isGroup);
      } catch (err) {
        console.error(`❌ Error in command "${commandName}":`, err);
      }
    }
  });
}

startBot();
