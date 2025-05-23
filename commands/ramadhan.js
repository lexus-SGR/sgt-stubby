module.exports = {
  name: "ramadhan",
  description: "Ramadhan fasting reminder.",
  emoji: "🌙",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "🌙 *Ramadhan Reminder*\n\n“Whoever fasts during Ramadan out of faith and seeking reward, his past sins will be forgiven.” – Bukhari & Muslim"
    });
  }
};
