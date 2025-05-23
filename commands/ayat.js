module.exports = {
  name: "ayat",
  description: "Send a random verse from the Quran.",
  emoji: "📖",
  async execute(sock, msg) {
    const ayats = [
      "Indeed, Allah is with those who are patient. (Quran 2:153)",
      "So remember Me; I will remember you. (Quran 2:152)",
      "And He found you lost and guided [you]. (Quran 93:7)",
    ];
    const random = ayats[Math.floor(Math.random() * ayats.length)];
    await sock.sendMessage(msg.key.remoteJid, { text: `📖 *Quran Ayah*\n\n${random}` });
  }
};
