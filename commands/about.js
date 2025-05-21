module.exports = {
  name: "about",
  description: "About this bot.",
  emoji: "ℹ️",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, { react: { text: "ℹ️", key: msg.key } });
    const aboutText = `
*BEN WHITTAKER TECH BOT*
Version: 1.0.0
Developer: Ben Whittaker
Powered by WhatsApp Baileys Library.
Type !help to see commands.
🚀                       🇹🇿
    `;
    await sock.sendMessage(msg.key.remoteJid, { text: aboutText });
  }
};
