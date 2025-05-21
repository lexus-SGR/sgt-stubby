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

const antiLinkGroups = {};
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

      // Send welcome message to owner when bot is online
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

  // Load commands from commands folder
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

      // === AUTO VIEW STATUS ===
      if (from === "status@broadcast") {
        try {
          await sock.sendMessage("status@broadcast", {
            viewOnce: { statusJid: sender }
          });
        } catch {}
        continue; // no need to process commands for status messages
      }

      // Read message text
      const body = msg.message?.conversation ||
                   msg.message?.extendedTextMessage?.text ||
                   msg.message?.imageMessage?.caption || "";

      // Fake typing presence
      await sock.sendPresenceUpdate("recording", from);
      setTimeout(() => {
        sock.sendPresenceUpdate("available", from);
      }, 5000);

      // === ANTI-LINK in groups ===
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

      // === Command handler ===
      if (!body.startsWith(PREFIX)) continue;

      const commandName = body.slice(PREFIX.length).split(/\s+/)[0].toLowerCase();
      const args = body.trim().split(/\s+/).slice(1);

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

  // === ANTI-DELETE EVENT ===
  sock.ev.on("messages.delete", async (message) => {
    const { key, participant, remoteJid } = message;

    if (!remoteJid.endsWith("@g.us")) return; // only group

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
