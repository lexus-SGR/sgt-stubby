module.exports = {
  name: "hadith",
  description: "Send a random Hadith.",
  emoji: "📜",
  async execute(sock, msg) {
    const hadiths = [
      "“The best among you are those who have the best manners and character.” – Bukhari",
      "“Make things easy and do not make them difficult.” – Bukhari & Muslim",
      "“The strong person is not the one who can wrestle, but the one who can control himself at the time of anger.” – Bukhari",
    ];
    const random = hadiths[Math.floor(Math.random() * hadiths.length)];
    await sock.sendMessage(msg.key.remoteJid, { text: `📜 *Hadith*\n\n${random}` });
  }
};
