module.exports = {
  name: "islamquote",
  description: "Send an inspirational Islamic quote.",
  emoji: "🧠",
  async execute(sock, msg) {
    const quotes = [
      "Put your trust in Allah, and everything will fall into place.",
      "This dunya is only temporary, prepare for the akhirah.",
      "Whatever Allah has written for you will reach you.",
    ];
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    await sock.sendMessage(msg.key.remoteJid, { text: `🧠 *Islamic Quote*\n\n_${random}_` });
  }
};
