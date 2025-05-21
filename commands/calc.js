module.exports = {
  name: "calc",
  description: "Calculate a math expression.",
  emoji: "🧮",
  async execute(sock, msg, args) {
    await sock.sendMessage(msg.key.remoteJid, { react: { text: "🧮", key: msg.key } });
    if (!args.length) return await sock.sendMessage(msg.key.remoteJid, { text: "Please provide an expression." });
    try {
      const expression = args.join(" ");
      // VERY basic and unsafe eval, better to replace with a math lib in production
      const result = eval(expression);
      await sock.sendMessage(msg.key.remoteJid, { text: `Result: ${result}` });
    } catch {
      await sock.sendMessage(msg.key.remoteJid, { text: "Invalid expression." });
    }
  }
};
