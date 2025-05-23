module.exports = {
  name: "whatistawheed",
  description: "Explains the concept of Tawheed (Oneness of Allah)",
  emoji: "☝️",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: "☝️", key: msg.key }
    });

    const message = `☝️ *What is Tawheed?*\n
Tawheed means the oneness of Allah. It is the most fundamental concept in Islam. It declares that there is no god but Allah, and He has no partners, no children, and nothing is like Him.

Tawheed is divided into three categories:
1. *Tawheed al-Rububiyyah* – Belief that Allah alone is the Creator, Sustainer.
2. *Tawheed al-Uluhiyyah* – Worship should be only for Allah.
3. *Tawheed al-Asma wa Sifat* – Belief in Allah’s names and attributes without changing or denying them.

Belief in Tawheed leads to sincerity (ikhlas), humility, and complete dependence on Allah.`;

    await sock.sendMessage(msg.key.remoteJid, { text: message });
  }
};
