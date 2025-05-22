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

      // Send image with caption first
      await sock.sendMessage(m.chat, {
        image: stickerImage,
        caption,
        footer: "SPD-XMD Bot",
      }, { quoted: m });

      // Then send audio instrumental
      await sock.sendMessage(m.chat, {
        audio: musicAudio,
        mimetype: "audio/mpeg",
        ptt: false,  // false means not voice note, just normal audio
      }, { quoted: m });

    } catch (error) {
      console.error("Error sending help menu with music:", error);
      await sock.sendMessage(m.chat, { text: "Sorry, there was an error loading the help menu." }, { quoted: m });
    }
  }
};
