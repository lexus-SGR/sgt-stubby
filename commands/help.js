const fs = require("fs");
const path = require("path");

module.exports = {
  name: "help",
  alias: ["menu", "commands"],
  desc: "Show help menu with commands and background music",
  category: "general",
  async execute(m, { sock, command, prefix }) {
    try {
      const folderPath = path.join(__dirname, "image+music");
      const imagePath = path.join(folderPath, "tech-help.png");
      const musicPath = path.join(folderPath, "spd.mp3");

      if (!fs.existsSync(imagePath) || !fs.existsSync(musicPath)) {
        return sock.sendMessage(m.chat, {
          text: "Missing help image or music file.",
        }, { quoted: m });
      }

      const stickerImage = fs.readFileSync(imagePath);
      const musicAudio = fs.readFileSync(musicPath);

      const caption = `
╔══════════════════════════════╗
║       🎭  Sticker Maker 🎭      ║
╠══════════════════════════════╣
║ Command: ${prefix}sticker
║ Description: Create fun stickers
║ Usage: Send image/video + command
╚══════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 𝗛𝗢𝗪 𝗧𝗢 𝗨𝗦𝗘:
──────────────────────────────
1️⃣ Send an image or short video
2️⃣ Reply with ${prefix}sticker
3️⃣ Wait for your sticker!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️ 𝗙𝗘𝗔𝗧𝗨𝗥𝗘𝗦:
──────────────────────────────
✅ Supports images, videos & gifs
✅ Custom sticker pack name
✅ Works with replies & direct media

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🆘 For help, type ${prefix}help sticker
╔══════════════════════════════╗
║     Powered by SPD-XMD Bot    ║
╚══════════════════════════════╝
`;

      // Send image with caption and buttons
      await sock.sendMessage(m.chat, {
        image: stickerImage,
        caption,
        footer: "SPD-XMD Bot",
        buttons: [
          { buttonId: `${prefix}menu`, buttonText: { displayText: "📜 More Commands" }, type: 1 },
          { buttonId: "https://wa.me/255760317060", buttonText: { displayText: "👤 Contact Owner" }, type: 1 }
        ],
        headerType: 4
      }, { quoted: m });

      // Send background audio separately
      await sock.sendMessage(m.chat, {
        audio: musicAudio,
        mimetype: "audio/mpeg",
        ptt: false,
      }, { quoted: m });

    } catch (error) {
      console.error("Error sending help menu with music:", error);
      await sock.sendMessage(m.chat, {
        text: "Sorry, there was an error loading the help menu.",
      }, { quoted: m });
    }
  }
};
