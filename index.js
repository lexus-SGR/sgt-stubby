require("dotenv").config();
const fs = require("fs");
const path = require("path");
const P = require("pino");
const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

const OWNER_JID = "255760317060@s.whatsapp.net";
const PREFIX = "!";

const DEFAULT_ANTILINK = process.env.ANTILINK === "on";

const antiLinkGroups = new Proxy({}, {
  get(target, key) {
    if (!(key in target)) {
      target[key] = { enabled: DEFAULT_ANTILINK, action: "warn" };
    }
    return target[key];
  }
});

const antiDeleteGroups = {};

async function isBotAdmin(sock, groupId) {
  try {
    const metadata = await sock.groupMetadata(groupId);
    const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    const botParticipant = metadata.participants.find(p => p.id === botNumber);
    return botParticipant?.admin === "admin" || botParticipant?.admin === "superadmin";
  } catch {
    return false;
  }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: "silent" }))
    },
    logger: P({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    } else if (connection === "open") {
      console.log("✅ Bot connected!");

      const welcomeMsg = `
*WELCOME TO BEN WHITTAKER TECH BOT* 🔰

✅ *Bot is now online and connected successfully!*

🔧 *Prefix:* ${PREFIX}
🤖 *Bot Name:* BEN WHITTAKER TECH
👑 *Owner:* @${OWNER_JID.split("@")[0]}

ℹ️ Type *${PREFIX}menu* or *${PREFIX}help* to see available commands.

📌 *Need assistance?* Just type *${PREFIX}support*.
      `;
      await sock.sendMessage(OWNER_JID, { text: welcomeMsg });
    }
  });

  const commands = new Map();
  const commandsPath = path.join(__dirname, "commands");
  if (fs.existsSync(commandsPath)) {
    for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"))) {
      const cmd = require(path.join(commandsPath, file));
      if (cmd.name) commands.set(cmd.name.toLowerCase(), cmd);
    }
  }

  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message) continue;

      const from = msg.key.remoteJid;
      const isGroup = from.endsWith("@g.us");
      const sender = msg.key.participant || msg.key.remoteJid;

      if (from === "status@broadcast") {
        try {
          await sock.sendMessage("status@broadcast", {
            viewOnce: { statusJid: sender }
          });
        } catch {}
        continue;
      }

      const body = msg.message?.conversation ||
                   msg.message?.extendedTextMessage?.text ||
                   msg.message?.imageMessage?.caption || "";

      await sock.sendPresenceUpdate("recording", from);
      setTimeout(() => {
        sock.sendPresenceUpdate("available", from);
      }, 5000);

      if (isGroup && antiLinkGroups[from]?.enabled) {
        const linkRegex = /https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/;
        if (linkRegex.test(body) && sender !== OWNER_JID) {
          const isAdmin = await isBotAdmin(sock, from);
          if (!isAdmin) {
            await sock.sendMessage(from, {
              text: "⚠️ I'm not admin, can't perform anti-link action."
            });
            continue;
          }

          if (antiLinkGroups[from].action === "warn") {
            await sock.sendMessage(from, {
              text: `⚠️ *@${sender.split("@")[0]}*, link sharing not allowed!`,
              mentions: [sender]
            });
          } else if (antiLinkGroups[from].action === "remove") {
            await sock.sendMessage(from, {
              text: `🚫 *@${sender.split("@")[0]}* removed for sharing link.`,
              mentions: [sender]
            });
            await sock.groupParticipantsUpdate(from, [sender], "remove");
          }
          continue;
        }
      }

      if (!body.startsWith(PREFIX)) continue;

      const commandName = body.slice(PREFIX.length).split(/\s+/)[0].toLowerCase();
      const args = body.trim().split(/\s+/).slice(1);

      // === ANTILINK COMMAND ===
      if (commandName === "antilink") {
        if (!isGroup) {
          await sock.sendMessage(from, { text: "🚫🔗🛡 This command can only be used in groups." });
          return;
        }

        const isAdmin = await isBotAdmin(sock, from);
        if (!isAdmin) {
          await sock.sendMessage(from, { text: "🚫🔗🛡 I need to be admin to manage Anti-Link settings." });
          return;
        }

        const input = args[0]?.toLowerCase();
        const setting = antiLinkGroups[from];

        if (input === "on") {
          if (setting.enabled) {
            await sock.sendMessage(from, { text: "🚫🔗🛡 Anti-Link is already ON." });
          } else {
            setting.enabled = true;
            await sock.sendMessage(from, { text: "✅ Anti-Link is now *enabled*." });
          }
        } else if (input === "off") {
          if (!setting.enabled) {
            await sock.sendMessage(from, { text: "🚫🔗🛡 Anti-Link is already OFF." });
          } else {
            setting.enabled = false;
            await sock.sendMessage(from, { text: "❌ Anti-Link has been *disabled*." });
          }
        } else {
          await sock.sendMessage(from, { text: `🔧 Usage: *${PREFIX}antilink on/off*` });
        }
        return;
      }

      if (commands.has(commandName)) {
        try {
          await commands.get(commandName).execute(sock, msg, args, {
            antiLinkGroups,
            antiDeleteGroups,
            OWNER_JID,
            PREFIX
          });
        } catch (err) {
          console.error(`Error executing command ${commandName}:`, err);
        }
      }
    }
  });

  sock.ev.on("messages.delete", async (message) => {
    const { key, participant, remoteJid } = message;
    if (!remoteJid.endsWith("@g.us")) return;

    if (antiDeleteGroups[remoteJid]?.enabled) {
      const isAdmin = await isBotAdmin(sock, remoteJid);
      if (!isAdmin) {
        await sock.sendMessage(remoteJid, {
          text: "⚠️ Anti-delete is enabled but I'm not admin, can't prevent deletion."
        });
        return;
      }

      if (message.message) {
        await sock.sendMessage(remoteJid, {
          text: `⚠️ *@${participant.split("@")[0]}* tried to delete a message!`,
          mentions: [participant]
        });
        await sock.relayMessage(remoteJid, message.message, { messageId: key.id });
      }
    }
  });
}

startBot();
