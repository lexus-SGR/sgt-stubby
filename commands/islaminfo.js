module.exports = {
  name: "islaminfo",
  description: "Give short introduction about Islam.",
  emoji: "🧭",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "🧭 *What is Islam?*\n\nIslam is a monotheistic religion that teaches belief in one God (Allah) and the final prophet, Muhammad (SAW). The Quran is its holy book, and it emphasizes peace, mercy, and guidance for all humanity."
    });
  }
};
