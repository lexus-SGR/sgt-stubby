module.exports = {
  name: "bismillah",
  description: "Send Bismillah reminder.",
  emoji: "🕌",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, { text: "بِسْمِ ٱللّٰهِ الرَّحْمَٰنِ الرَّحِيمِ\n\n_In the name of Allah, the Most Gracious, the Most Merciful._" });
  }
};
