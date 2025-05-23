module.exports = {
  name: "whoareangels",
  description: "Explains who the angels are in Islam",
  emoji: "👼",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: "👼", key: msg.key }
    });

    const message = `👼 *Who are the Angels in Islam?*\n
Angels (*Malaika*) are created from light and serve Allah. They do not eat, sleep, or disobey Him. They perform various tasks:

- *Jibreel* – brings revelation to prophets.
- *Mikaeel* – controls rain and sustenance.
- *Israfeel* – will blow the trumpet on the Day of Judgment.
- *Malik* – guardian of Hell.
- *Munkar & Nakir* – question the dead in the grave.

Belief in angels is one of the six pillars of Iman.`;

    await sock.sendMessage(msg.key.remoteJid, { text: message });
  }
};
