module.exports = {
  name: "whatisramadan",
  description: "Answer: What is Ramadan?",
  emoji: "🌙",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: "🌙", key: msg.key }
    });

    const message = `🌙 *What is Ramadan?*\n
Ramadan is the ninth month of the Islamic calendar. It is considered the holiest month in Islam, during which Muslims fast from dawn to sunset. The fast includes abstaining from food, drink, bad behavior, and sinful speech.

Fasting (Sawm) during Ramadan is one of the Five Pillars of Islam. It teaches self-discipline, God-consciousness (Taqwa), compassion for the needy, and spiritual growth.

Muslims also perform extra prayers (Taraweeh), give charity (Zakat and Sadaqah), and increase their reading of the Quran during this sacred month.`;

    await sock.sendMessage(msg.key.remoteJid, {
      text: message
    });
  }
};
