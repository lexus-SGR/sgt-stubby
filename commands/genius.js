commands.set('genius', {
  description: "IQ rating for fun",
  async execute(sock, msg, args, from) {
    const iq = Math.floor(Math.random() * 161);
    const label = iq > 140 ? "Einstein level!" : iq > 100 ? "Above average!" : "You tried your best.";

    const text = `🧠 *IQ Test Result: ${iq}*\n\n_${label}_`;
    await sock.sendMessage(from, { text }, { quoted: msg });
    await sock.sendMessage(from, { react: { text: "🧠", key: msg.key } });
  }
});
