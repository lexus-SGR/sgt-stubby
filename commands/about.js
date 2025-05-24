module.exports = {
  name: "about",
  description: "Maelezo kuhusu bot.",
  emoji: "ℹ️",
  async execute(sock, msg, args, text, prefix) {
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: "ℹ️", key: msg.key }
    });

    const aboutText = `
*BEN WHITTAKER TECH BOT*
Version: 1.0.0
Developer: Ben Whittaker
Powered by Baileys Library.
Tumia *${prefix}help* kuona commands zote.
🚀🇹🇿
    `;
    await sock.sendMessage(msg.key.remoteJid, { text: aboutText });
  }
};
