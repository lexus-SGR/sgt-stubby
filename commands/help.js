const fs = require("fs");
const path = require("path");

module.exports = {
  name: "help",
  alias: ["menu", "commands"],
  desc: "Show help menu with image and music",
  emoji: "📜",
  async execute(sock, msg) {
    try {
      const prefix = "!"; // fallback prefix
      const folderPath = path.join(__dirname, "image+music");
      const imagePath = path.join(folderPath, "tech-help.png");
      const musicPath = path.join(folderPath, "spd.mp3");

      if (!fs.existsSync(imagePath) || !fs.existsSync(musicPath)) {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: "Missing help image or music file.",
        }, { quoted: msg });
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
║     Powered by SPD-XMD Bot     ║
╚══════════════════════════════╝
`;

      await sock.sendMessage(msg.key.remoteJid, {
        image: stickerImage,
        caption,
        footer: "SPD-XMD Bot",
        buttons: [
          { buttonId: `${prefix}menu`, buttonText: { displayText: "📜 More Commands" }, type: 1 },
          { buttonId: `owner`, buttonText: { displayText: "👤 Contact Owner" }, type: 1 }
        ],
        headerType: 4
      }, { quoted: msg });

      await sock.sendMessage(msg.key.remoteJid, {
        audio: musicAudio,
        mimetype: "audio/mpeg",
        ptt: false
      }, { quoted: msg });

    } catch (error) {
      console.error("Error sending help menu with music:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "Sorry, there was an error loading the help menu.",
      }, { quoted: msg });
    }
  }
};
