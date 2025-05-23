const prefix = '!'; // weka prefix yako hapa au chukua kutoka .env

const antilinkCommands = {
  name: "antilink",
  description: "Manage Anti-link features to keep your group safe",
  emoji: "🚫",
  async execute(sock, msg, args, isGroup, groupAdmins, antilinkSettings) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const isAdmin = groupAdmins.includes(sender.split(":")[0]);

    if (!isGroup) {
      return sock.sendMessage(from, { text: "❌ *Anti-link commands work only in groups.*" });
    }
    if (!isAdmin) {
      return sock.sendMessage(from, { text: "⚠️ *You must be a group admin to use this command.*" });
    }

    if (args.length === 0) {
      return sock.sendMessage(from, {
        text: `❗*Usage:*\n
*${prefix}antilink on* - Enable anti-link protection 🚫\n
*${prefix}antilink off* - Disable anti-link protection ❌\n
*${prefix}antilink list* - Show anti-link status 📋\n
*${prefix}antilink reset* - Reset anti-link settings 🔄\n
*${prefix}antilink action remove* - Remove posted group links ⛔`
      });
    }

    const action = args[0].toLowerCase();

    switch (action) {
      case "on":
        antilinkSettings[from] = { enabled: true, actionRemove: false };
        await sock.sendMessage(from, { text: "✅ *Anti-link protection is now ENABLED!* 🚫" });
        break;

      case "off":
        antilinkSettings[from] = { enabled: false, actionRemove: false };
        await sock.sendMessage(from, { text: "❌ *Anti-link protection is now DISABLED!* ❌" });
        break;

      case "list":
        const status = antilinkSettings[from]?.enabled ? "ENABLED ✅" : "DISABLED ❌";
        const removeAction = antilinkSettings[from]?.actionRemove ? "ON ✅" : "OFF ❌";
        await sock.sendMessage(from, {
          text: `📋 *Anti-link Status:*\n\nProtection: *${status}*\nRemove Links Action: *${removeAction}*`
        });
        break;

      case "reset":
        delete antilinkSettings[from];
        await sock.sendMessage(from, { text: "♻️ *Anti-link settings have been RESET!* 🔄" });
        break;

      case "action":
        if (args[1]?.toLowerCase() === "remove") {
          if (!antilinkSettings[from]?.enabled) {
            return sock.sendMessage(from, { text: "⚠️ *Enable anti-link first using* `antilink on` 🚫" });
          }
          antilinkSettings[from].actionRemove = true;
          await sock.sendMessage(from, { text: "⛔ *Anti-link REMOVE ACTION is now ENABLED!* Links will be removed automatically." });
        } else {
          await sock.sendMessage(from, { text: "❓ *Invalid action. Use:* `antilink action remove`" });
        }
        break;

      default:
        await sock.sendMessage(from, { text: "❓ *Invalid option. Use on/off/list/reset/action remove*" });
    }
  },
};

// Anti-link detection
async function antiLinkCheck(sock, message, antilinkSettings, groupAdmins) {
  const from = message.key.remoteJid;
  if (!antilinkSettings[from]?.enabled) return;

  const sender = message.key.participant || message.key.remoteJid;
  const isAdmin = groupAdmins.includes(sender.split(":")[0]);

  const textMsg = message.message?.conversation ||
                  message.message?.extendedTextMessage?.text ||
                  message.message?.imageMessage?.caption ||
                  message.message?.videoMessage?.caption || '';

  const linkRegex = /https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+/gi;

  if (linkRegex.test(textMsg)) {
    if (!isAdmin) {
      try {
        await sock.sendMessage(from, {
          text: `⚠️ @${sender.split("@")[0]}, posting group links is *not allowed*!`,
          mentions: [sender]
        });

        if (antilinkSettings[from].actionRemove) {
          await sock.sendMessage(from, { delete: message.key });
        }
      } catch (err) {
        console.log("Anti-link error:", err);
      }
    }
  }
}

module.exports = {
  antilinkCommands,
  antiLinkCheck,
};
