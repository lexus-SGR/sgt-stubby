module.exports = {
  name: "whatisjinn",
  description: "Explanation of Jinn in Islam",
  emoji: "👻",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: "👻", key: msg.key }
    });

    const message = `👻 *What are Jinn in Islam?*\n
Jinn are beings created by Allah from smokeless fire. Like humans, they have free will and can be Muslims or non-Muslims. They live in a parallel world and are mostly unseen.

They can eat, marry, have children, and die. Shaytan (Iblis) is from the Jinn.

Some Jinn may harm humans, but they cannot do anything without Allah’s permission. We are taught to seek refuge in Allah from them by reciting *Ayatul Kursi*, *Surah Falaq*, and *Surah Naas*.`;

    await sock.sendMessage(msg.key.remoteJid, { text: message });
  }
};
