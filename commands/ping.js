module.exports = {
  name: "ping",
  description: "Checks if the bot is alive.",
  emoji: "🏓",
  async execute(sock, msg) {
    // React with ping emoji first
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: "🏓", key: msg.key }
    });
    // Then reply pong
    await sock.sendMessage(msg.key.remoteJid, { text: "Pong! 🏓" });
  }
};
