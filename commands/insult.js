commands.set('insult', {
  description: "Roast your friends (light & fun)",
  async execute(sock, msg, args, from) {
    const insults = [
      "You're the reason shampoo has instructions.",
      "You have something on your chin... no, the third one down.",
      "You're like a cloud. When you disappear, it's a beautiful day."
    ];
    const insult = insults[Math.floor(Math.random() * insults.length)];

    const text = `💢 *Roast Time:*\n\n${insult}`;
    await sock.sendMessage(from, { text }, { quoted: msg });
    await sock.sendMessage(from, { react: { text: "💢", key: msg.key } });
  }
});
