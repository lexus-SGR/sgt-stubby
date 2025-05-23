module.exports = {
  name: "whatisislam",
  description: "Answer: What is Islam?",
  emoji: "🧭",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "🧭 *What is Islam?*\n\nIslam is a monotheistic religion that teaches that there is only one God (Allah), and Muhammad (peace be upon him) is His final messenger. The Quran is the holy book, and Islam means 'submission to the will of Allah'."
    });
  }
};
