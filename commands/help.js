module.exports = {
  name: "help",
  alias: ["menu", "commands"],
  desc: "Show help menu (text only)",
  emoji: "📜",
  async execute(sock, msg) {
    try {
      const prefix = "!"; // fallback prefix

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
        text: caption
      }, { quoted: msg });

    } catch (error) {
      console.error("Error sending help menu:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "Sorry, there was an error loading the help menu.",
      }, { quoted: msg });
    }
  }
};
