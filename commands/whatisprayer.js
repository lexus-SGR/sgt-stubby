module.exports = {
  name: "whatisprayer",
  description: "Answer: What is Salah (Prayer)?",
  emoji: "🕌",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: "🕌", key: msg.key }
    });

    const message = `🕌 *What is Salah (Prayer)?*\n
Salah is the second pillar of Islam. It is the daily ritual prayer performed by Muslims five times a day at prescribed times: Fajr, Dhuhr, Asr, Maghrib, and Isha.

It is a direct connection between the believer and Allah. Each prayer includes physical movements like standing, bowing, prostrating, and sitting, while reciting verses from the Quran and supplications.

Salah builds discipline, mindfulness, and strengthens one's relationship with Allah. Missing Salah intentionally is a serious matter in Islam.`;

    await sock.sendMessage(msg.key.remoteJid, {
      text: message
    });
  }
};
