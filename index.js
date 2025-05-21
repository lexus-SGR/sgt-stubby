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
const emojiReactions = ["❤️", "😂", "🔥", "👍", "😎", "🤖"];
const randomEmoji = () => emojiReactions[Math.floor(Math.random() * emojiReactions.length)];

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
    if (!msg.message || msg.key.fromMe) return;

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
    }, 5000);

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
      return;
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
    if (body.startsWith(PREFIX)) {
      const cmdName = body.slice(PREFIX.length).trim().split(/\s+/)[0].toLowerCase();
      const args = body.trim().split(/\s+/).slice(1);

      if (commands.has(cmdName)) {
        try {
          await commands.get(cmdName).execute(sock, msg, args);
        } catch (err) {
          console.error(`Error executing command ${cmdName}:`, err);
          await sock.sendMessage(from, { text: `❌ Error executing command *${cmdName}*.` });
        }
      }
    }
  });
}

startBot();
