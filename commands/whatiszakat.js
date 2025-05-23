module.exports = {
  name: "whatiszakat",
  description: "Answer: What is Zakat?",
  emoji: "💰",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: "💰", key: msg.key }
    });

    const message = `💰 *What is Zakat?*\n
Zakat is the third pillar of Islam. It is an obligatory form of charity required from every financially stable Muslim. It purifies one’s wealth and soul.

Muslims are required to give 2.5% of their annual savings to the poor and needy. Zakat is different from Sadaqah (voluntary charity) because it is compulsory.

It helps eliminate poverty and promotes social justice and equality in society. The Quran and Hadith both emphasize the importance of Zakat in strengthening the community.`;

    await sock.sendMessage(msg.key.remoteJid, {
      text: message
    });
  }
};
