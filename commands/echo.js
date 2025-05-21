module.exports = {
  name: "echo",
  description: "Repeat your text.",
  emoji: "🗣️",
  async execute(sock, msg, args) {
    await sock.sendMessage(msg.key.remoteJid, { react: { text: "🗣️", key: msg.key } });
    if (!args.length) return await sock.sendMessage(msg.key.remoteJid, { text: "Please provide text to echo." });
    const text = args.join(" ");
    await sock.sendMessage(msg.key.remoteJid, { text });
  }
};
