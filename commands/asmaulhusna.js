module.exports = {
  name: "asmaulhusna",
  description: "Send one of the 99 names of Allah.",
  emoji: "🌟",
  async execute(sock, msg) {
    const names = [
      "Ar-Rahman (The Beneficent)",
      "Ar-Rahim (The Merciful)",
      "Al-Malik (The King)",
      "Al-Quddus (The Most Sacred)",
      "As-Salam (The Source of Peace)",
    ];
    const random = names[Math.floor(Math.random() * names.length)];
    await sock.sendMessage(msg.key.remoteJid, { text: `🌟 *Asmaul Husna*\n\n${random}` });
  }
};
