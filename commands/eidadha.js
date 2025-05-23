module.exports = {
  name: "eidadha",
  description: "Answer: What is Eid al-Adha?",
  emoji: "🕋",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: "🕋", key: msg.key }
    });

    const message = `🕋 *What is Eid al-Adha?*\n
Eid al-Adha, also known as the *Festival of Sacrifice*, is one of the two major Islamic holidays. It commemorates the willingness of Prophet Ibrahim (Abraham) to sacrifice his son Ismail (Ishmael) as an act of obedience to Allah.

Before the sacrifice could happen, Allah replaced Ismail with a ram — symbolizing mercy and obedience. Muslims celebrate this event by offering an animal (cow, goat, or sheep) as Qurbani.

This Eid falls on the 10th of Dhul Hijjah, after the Day of Arafah, and coincides with the Hajj pilgrimage. The meat from the sacrifice is divided into three parts: one-third for the family, one-third for relatives/friends, and one-third for the poor.

It is a time of prayer, charity, unity, and gratitude to Allah.`;

    await sock.sendMessage(msg.key.remoteJid, {
      text: message
    });
  }
};
