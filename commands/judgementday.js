module.exports = {
  name: "judgementday",
  description: "Answer: What is the Day of Judgement?",
  emoji: "⚖️",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: "⚖️", key: msg.key }
    });

    const message = `⚖️ *What is the Day of Judgement?*\n
The Day of Judgement (Yawm al-Qiyamah) is a major belief in Islam. It is the day when Allah will resurrect all of creation and judge them based on their deeds.

Every soul will be held accountable. The good will be rewarded with Jannah (Paradise) and the evil will face punishment in Jahannam (Hellfire).

Belief in this day encourages Muslims to live righteous lives, avoid sin, and constantly seek forgiveness. Only Allah knows when this day will occur.`;

    await sock.sendMessage(msg.key.remoteJid, {
      text: message
    });
  }
};
