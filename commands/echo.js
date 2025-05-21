module.exports = {
  name: "echo",
  description: "Echoes back the text sent.",
  emoji: "🗣️",
  async execute(sock, msg, args) {
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: "🗣️", key: msg.key }
    });
    if (!args.length) return await sock.sendMessage(msg.key.remoteJid, { text: "Please provide text to echo." });
    await sock.sendMessage(msg.key.remoteJid, { text: args.join(" ") });
  }
};
