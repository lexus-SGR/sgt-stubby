const fs = require("fs");
const path = require("path");

module.exports = {
  name: "alive",
  description: "Check if the bot is running.",
  emoji: "✅",
  async execute(sock, msg) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { react: { text: "✅", key: msg.key } });

      const aliveImage = fs.readFileSync(path.join(__dirname, "lexus AI HUB.png"));
      const uptime = process.uptime();
      const hrs = Math.floor(uptime / 3600);
      const mins = Math.floor((uptime % 3600) / 60);
      const secs = Math.floor(uptime % 60);

      const aliveMsg = `
╭───[ *SPD-XMD IS ONLINE* ]───╮
│ ✅ Bot is running smoothly!
│ ⏱ Uptime: ${hrs}h ${mins}m ${secs}s
│ 🧠 AI | Downloader | Tools | Group
│ 🌍 GitHub: github.com/lexus-SGR/sgt-stubby.git
╰────────────────────────────╯

*Thank you for using SPD-XMD Bot!*
      `;

      await sock.sendMessage(msg.key.remoteJid, {
        image: aliveImage,
        caption: aliveMsg,
        footer: "SPD-XMD Bot"
      });

    } catch (error) {
      console.error("Error sending alive status:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Sorry, unable to fetch bot status right now."
      });
    }
  }
};
