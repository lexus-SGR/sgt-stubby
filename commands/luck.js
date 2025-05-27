commands.set('luck', {
  description: "Get your luck percentage today",
  async execute(sock, msg, args, from) {
    const luck = Math.floor(Math.random() * 101);
    const tip = luck > 80 ? "Try your luck in lottery today!" : luck > 50 ? "It’s an okay day." : "Stay low, luck is low.";

    const text = `🍀 *Today's Luck: ${luck}%*\n\n_${tip}_`;
    await sock.sendMessage(from, { text }, { quoted: msg });
    await sock.sendMessage(from, { react: { text: "🍀", key: msg.key } });
  }
});
