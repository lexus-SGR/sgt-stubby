const antiLinkDB = {};

module.exports = {
  name: "antilink",
  description: "Enable or disable anti-link system in groups",
  async execute(sock, msg, args, from, sender, isGroup, groupAdmins) {
    if (!isGroup) {
      await sock.sendMessage(from, { text: "⚠️ This command only works in groups." });
      return;
    }

    if (!groupAdmins.includes(sender)) {
      await sock.sendMessage(from, { text: "⛔ Only admins can change Anti-Link settings." });
      return;
    }

    antiLinkDB[from] = antiLinkDB[from] || { enabled: false, action: "warn" };

    if (!args[0]) {
      return await sock.sendMessage(from, {
        text: `🛡️ *Anti-Link Settings:*\n\nStatus: ${antiLinkDB[from].enabled ? "✅ ON" : "❌ OFF"}\nAction: ${antiLinkDB[from].action.toUpperCase()}\n\nCommands:\n• !antilink on/off\n• !antilink action warn/remove`
      });
    }

    const subCmd = args[0].toLowerCase();

    if (subCmd === "on") {
      if (antiLinkDB[from].enabled) {
        await sock.sendMessage(from, {
          text: "⚠️ Anti-Link is already *ON* in this group."
        });
      } else {
        antiLinkDB[from].enabled = true;
        await sock.sendMessage(from, { text: "✅ Anti-Link has been *enabled* for this group." });
        await sock.sendMessage(from, { react: { text: "🛡️", key: msg.key } });
      }
    } else if (subCmd === "off") {
      antiLinkDB[from].enabled = false;
      await sock.sendMessage(from, { text: "❌ Anti-Link has been *disabled* for this group." });
      await sock.sendMessage(from, { react: { text: "🔕", key: msg.key } });
    } else if (subCmd === "action") {
      if (!args[1]) {
        await sock.sendMessage(from, { text: "❌ Please choose an action: warn or remove" });
      } else {
        const action = args[1].toLowerCase();
        if (action === "warn" || action === "remove") {
          antiLinkDB[from].action = action;
          await sock.sendMessage(from, { text: `✅ Anti-Link action set to *${action}*.` });
          await sock.sendMessage(from, { react: { text: action === "warn" ? "⚠️" : "🗑️", key: msg.key } });
        } else {
          await sock.sendMessage(from, { text: "❌ Invalid action. Use warn/remove." });
        }
      }
    } else {
      await sock.sendMessage(from, {
        text: "❌ Invalid subcommand.\nUsage:\n• !antilink on/off\n• !antilink action warn/remove"
      });
    }
  },
  antiLinkDB
};
