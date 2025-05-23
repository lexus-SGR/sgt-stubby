module.exports = {
  name: "jumuah",
  description: "Send Jummah Mubarak message.",
  emoji: "📿",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, { text: "📿 *Jummah Mubarak!*\n\nMay Allah shower His mercy and blessings on you this Friday and always." });
  }
};
