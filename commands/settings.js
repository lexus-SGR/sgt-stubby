require("dotenv").config();

module.exports = {
  name: "settings",
  description: "Check current feature settings.",
  emoji: "⚙️",
  async execute(sock, msg) {
    const settings = `
╭───『 ⚙️ BOT SETTINGS STATUS 』───╮

✍️ AUTO_TYPING: ${process.env.AUTO_TYPING}
🎙️ AUTO_RECORD: ${process.env.AUTO_RECORD}
❤️ AUTO_REACT: ${process.env.AUTO_REACT}
✅ AUTO_READ_ALL: ${process.env.AUTO_READ_ALL}
🧬 AUTO_BIO: ${process.env.AUTO_BIO}
🚫 AUTO_BLOCK: ${process.env.AUTO_BLOCK}
🦵 AUTO_KICK: ${process.env.AUTO_KICK}

🤖 AI_COMMANDS: ${process.env.AI_COMMANDS}
☪️ ISLAMIC_FEATURES: ${process.env.ISLAMIC_FEATURES}
🔗 ANTILINK: ${process.env.ANTILINK}
🗑️ ANTIDELETE: ${process.env.ANTIDELETE}
👥 GROUP_COMMANDS: ${process.env.GROUP_COMMANDS}
🛡️ ADMIN_COMMANDS: ${process.env.ADMIN_COMMANDS}
🧰 TOOLS_COMMANDS: ${process.env.TOOLS_COMMANDS}
🎮 FUN_COMMANDS: ${process.env.FUN_COMMANDS}
🎬 MEDIA_COMMANDS: ${process.env.MEDIA_COMMANDS}
🖼️ STICKER_COMMANDS: ${process.env.STICKER_COMMANDS}
📄 PDF_COMMANDS: ${process.env.PDF_COMMANDS}
🔊 VOICE_COMMANDS: ${process.env.VOICE_COMMANDS}

╰────────────────────────────╯
Prefix: ${process.env.PREFIX}
Owner: ${process.env.OWNER_NAME}
Bot: ${process.env.BOT_NAME}
`;

    await sock.sendMessage(msg.key.remoteJid, {
      text: settings
    });
  }
};
