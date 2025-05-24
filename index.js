const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Fatuma WhatsApp Bot is running!"));
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port " + (process.env.PORT || 3000));
});

require('events').EventEmitter.defaultMaxListeners = 100;


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

  let index = 2;

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

  // In-memory settings
const antiFakeGroups = {};
const antilinkSettings = {};

// Main message handler
sock.ev.on("messages.upsert", async ({ messages }) => {
  const msg = messages[0];
  if (!msg.message) return;

  const from = msg.key.remoteJid;
  const isGroup = from.endsWith("@g.us");
  const sender = msg.key.participant || msg.key.remoteJid;
  const body = msg.message?.conversation ||
               msg.message?.extendedTextMessage?.text ||
               msg.message?.imageMessage?.caption || "";

  // ANTI-LINK FEATURE
  if (isGroup && antilinkSettings[from]) {
    const linkRegex = /(https?:\/\/[^\s]+|wa\.me\/[^\s]+|chat\.whatsapp\.com\/[^\s]+)/gi;
    if (linkRegex.test(body)) {
      try {
        const metadata = await sock.groupMetadata(from);
        const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        const botAdmin = metadata.participants.find(p => p.id === botJid)?.admin;
        const senderAdmin = metadata.participants.find(p => p.id === sender)?.admin;

        if (!botAdmin) {
          await sock.sendMessage(from, {
            text: `⚠️ @${sender.split("@")[0]} sent a link but I'm not admin.`,
            mentions: [sender]
          }, { quoted: msg });
          return;
        }

        if (!senderAdmin) {
          await sock.groupParticipantsUpdate(from, [sender], "remove");
          await sock.sendMessage(from, {
            text: `🚫 Anti-Link: @${sender.split("@")[0]} removed.`,
            mentions: [sender]
          }, { quoted: msg });
        }
      } catch (e) {
        console.error("AntiLink Error:", e);
      }
    }
  }

  // FAKE RECORDING PRESENCE
  await sock.sendPresenceUpdate("recording", from);
  setTimeout(() => {
    sock.sendPresenceUpdate("available", from);
  }, 3000);

  // AUTO VIEW STATUS
  if (msg.key.remoteJid === "status@broadcast" && process.env.AUTO_VIEW_STATUS === "on") {
    try {
      await sock.readMessages([msg.key]);
      await sock.sendMessage("status@broadcast", {
        react: { text: "👀", key: msg.key }
      });
    } catch (e) {
      console.error("Auto View Status Error:", e);
    }
    return;
  }

  // Ignore if message doesn't start with prefix
  if (!body.startsWith(PREFIX)) return;

  const args = body.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // GROUP ADMIN CHECK
  let isGroupAdmin = false;
  let isBotAdmin = false;

  if (isGroup) {
    try {
      const metadata = await sock.groupMetadata(from);
      const participants = metadata.participants || [];
      const senderData = participants.find(p => p.id === sender);
      const botData = participants.find(p => p.id === sock.user.id.split(":")[0] + "@s.whatsapp.net");
      isGroupAdmin = senderData?.admin != null;
      isBotAdmin = botData?.admin != null;
    } catch (e) {
      console.error("Group admin check failed:", e);
    }
  }

  // !set command
  if (command === "set") {
    require("./commands/set").execute(sock, msg, args);
  }

  // !viewstatus command
  if (command === "viewstatus") {
    await onViewStatus(sock, from, sender);
  }

  // !startbio command
  if (!isGroup && command === "startbio") {
    autoBio(sock);
  }

  // !antifake command
  if (isGroup && command === "antifake") {
    if (!isGroupAdmin && sender !== OWNER_JID) {
      return sock.sendMessage(from, { text: "⚠️ Admins only!" });
    }
    const option = args[0];
    if (option === "on") {
      antiFakeGroups[from] = true;
      await sock.sendMessage(from, { text: "✅ Anti-Fake enabled." });
    } else if (option === "off") {
      delete antiFakeGroups[from];
      await sock.sendMessage(from, { text: "❌ Anti-Fake disabled." });
    } else {
      await sock.sendMessage(from, { text: "Usage: !antifake on/off" });
    }
  }

  // !antilink command
  if (isGroup && command === "antilink") {
    if (!isGroupAdmin && sender !== OWNER_JID) {
      return sock.sendMessage(from, { text: "⚠️ Admins only!" });
    }
    const option = args[0];
    if (option === "on") {
      antilinkSettings[from] = true;
      await sock.sendMessage(from, { text: "✅ Anti-Link enabled." });
    } else if (option === "off") {
      delete antilinkSettings[from];
      await sock.sendMessage(from, { text: "❌ Anti-Link disabled." });
    } else {
      await sock.sendMessage(from, { text: "Usage: !antilink on/off" });
    }
  }

  // CUSTOM COMMAND HANDLER
  for (const [name, cmd] of commands) {
    if (command === name) {
      try {
        await cmd.execute(sock, msg, args);
      } catch (err) {
        console.error(`Error executing ${name}:`, err);
      }
      break;
    }
  }
});

// ANTI-FAKE JOINING USERS
sock.ev.on("group-participants.update", async (update) => {
  try {
    if (!antiFakeGroups[update.id]) return;
    for (let user of update.participants) {
      if (!user.startsWith("255")) {
        const metadata = await sock.groupMetadata(update.id);
        const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        const botAdmin = metadata.participants.find(p => p.id === botJid)?.admin;
        if (botAdmin) {
          await sock.sendMessage(update.id, {
            text: `❌ *@${user.split("@")[0]}* removed (not +255 number)`,
            mentions: [user]
          });
          await sock.groupParticipantsUpdate(update.id, [user], "remove");
        }
      }
    }
  } catch (err) {
    console.error("AntiFake Error:", err);
  }
});

// ANTI DELETE MESSAGE
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

// AUTO OPEN VIEW ONCE
sock.ev.on("messages.upsert", async ({ messages }) => {
  for (const msg of messages) {
    if (!msg.message || !msg.key || msg.key.fromMe) continue;
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");

    if (isGroup && msg.message?.viewOnceMessageV2 && process.env.AUTO_VIEW_ONCE === "on") {
      try {
        const metadata = await sock.groupMetadata(from);
        const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        const isBotAdmin = metadata.participants.find(p => p.id === botJid)?.admin;
        if (!isBotAdmin) return;

        const viewOnceMsg = msg.message.viewOnceMessageV2.message;
        await sock.sendMessage(from, {
          forward: msg,
          text: "👀 ViewOnce message opened!"
        });
      } catch (err) {
        console.error("Auto ViewOnce Error:", err);
      }
    }
  }
});

} // end of startBot()

startBot();
