module.exports = {
  name: "time",
  description: "Get current server time.",
  emoji: "⏰",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, { react: { text: "⏰", key: msg.key } });
    const now = new Date();
    await sock.sendMessage(msg.key.remoteJid, { text: `Current time:\n${now.toLocaleString()}` });
  }
};
