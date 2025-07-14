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

// Load Antilink groups (keep old method for backwards compatibility)
let antiLinkGroups = {};
try {
  antiLinkGroups = JSON.parse(fs.readFileSync('antilink.json'));
} catch {
  fs.writeFileSync('antilink.json', '{}');
}

// Feature flags with defaults and saved state
let featureFlags = {
  antilink: { enabled: false, action: "delete" }, // default action: delete
  antidelete: { enabled: false },
  autoViewOnce: { enabled: false }
};

// Load saved featureFlags
try {
  const savedFlags = JSON.parse(fs.readFileSync("featureFlags.json"));
  featureFlags = { ...featureFlags, ...savedFlags };
} catch {}

// Save flags helper
function saveFlags() {
  fs.writeFileSync("featureFlags.json", JSON.stringify(featureFlags, null, 2));
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

    const body =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      "";

    const commandName = body.startsWith(PREFIX)
      ? body.slice(PREFIX.length).split(/\s+/)[0].toLowerCase()
      : null;

    const args = body.trim().split(/\s+/).slice(1);
    const command = commands.get(commandName);

    // Owner commands for feature toggling
    if (body.startsWith(PREFIX) && number === OWNER_NUMBER) {
      const [cmd, arg1, arg2] = body.slice(PREFIX.length).trim().split(/\s+/);

      if (cmd === "antilink") {
        if (arg1 === "on" || arg1 === "off") {
          featureFlags.antilink.enabled = arg1 === "on";
          saveFlags();
          await sock.sendMessage(from, { text: `✅ Antilink turned ${arg1.toUpperCase()}` });
          return;
        }
        if (arg1 === "action" && ["delete", "remove", "warn"].includes(arg2)) {
          featureFlags.antilink.action = arg2;
          saveFlags();
          await sock.sendMessage(from, { text: `✅ Antilink action set to ${arg2.toUpperCase()}` });
          return;
        }
      }

      if (cmd === "antidelete") {
        if (arg1 === "on" || arg1 === "off") {
          featureFlags.antidelete.enabled = arg1 === "on";
          saveFlags();
          await sock.sendMessage(from, { text: `✅ Antidelete turned ${arg1.toUpperCase()}` });
          return;
        }
      }

      if (cmd === "viewonce") {
        if (arg1 === "on" || arg1 === "off") {
          featureFlags.autoViewOnce.enabled = arg1 === "on";
          saveFlags();
          await sock.sendMessage(from, { text: `✅ Auto view-once turned ${arg1.toUpperCase()}` });
          return;
        }
      }
    }

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
    if (featureFlags.autoViewOnce.enabled && msg.message.viewOnceMessage) {
      try {
        const viewOnceMsg = msg.message.viewOnceMessage.message;
        const mediaType = Object.keys(viewOnceMsg)[0];
        await sock.sendMessage(from, { [mediaType]: viewOnceMsg[mediaType] }, { quoted: msg });
      } catch (e) {
        console.error("❌ Error opening view once message:", e);
      }
    }

    // Antilink enforcement inside group
    if (
      featureFlags.antilink.enabled &&
      isGroup &&
      /https?:\/\/chat\.whatsapp\.com\/\S+/i.test(body)
    ) {
      const groupMetadata = await sock.groupMetadata(from);
      const isSenderAdmin = groupMetadata.participants.find((p) => p.id === sender)?.admin != null;
      const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
      const botIsAdmin = groupMetadata.participants.find((p) => p.id === botJid)?.admin != null;

      if (!isSenderAdmin && botIsAdmin) {
        try {
          if (featureFlags.antilink.action === "delete") {
            await sock.sendMessage(from, { delete: msg.key });
          } else if (featureFlags.antilink.action === "remove") {
            await sock.groupParticipantsUpdate(from, [sender], "remove");
          } else if (featureFlags.antilink.action === "warn") {
            await sock.sendMessage(from, {
              text: `⚠️ @${number}, usitumie link hapa!`,
              mentions: [sender],
            });
          }
        } catch (e) {
          console.error("❌ Antilink error:", e);
        }
      }
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

  // Antidelete logic (resend deleted messages)
  sock.ev.on("messages.update", async (updates) => {
    if (!featureFlags.antidelete.enabled) return;

    for (const update of updates) {
      if (update.messageStubType === 1) {
        // message deleted
        try {
          const chat = update.key.remoteJid;
          const deletedMsgId = update.key.id;
          const deletedMsg = await sock.loadMessage(chat, deletedMsgId);
          if (deletedMsg) {
            await sock.sendMessage(chat, deletedMsg.message, { quoted: deletedMsg });
          }
        } catch (e) {
          console.error("❌ Error resending deleted message:", e);
        }
      }
    }
  });

}

startBot();
