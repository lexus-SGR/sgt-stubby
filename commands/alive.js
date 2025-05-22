const fs = require("fs");
const path = require("path");

module.exports = {
  name: "alive",
  alias: ["botstatus", "up"],
  desc: "Check if the bot is running",
  category: "main",
  async execute(m, { sock, command }) {
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

    await sock.sendMessage(m.chat, {
      image: aliveImage,
      caption: aliveMsg
    });
  }
};
