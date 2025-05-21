const PREFIX = "!";

module.exports = {
  name: "help",
  description: "Lists all commands.",
  emoji: "📜",
  async execute(sock, msg, args, context) {
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: "📜", key: msg.key }
    });
    const commandsList = Array.from(context.commands.keys())
      .map(cmd => `*${PREFIX}${cmd}*`)
      .join("\n");
    await sock.sendMessage(msg.key.remoteJid, { text: `📜 Available commands:\n${commandsList}` });
  }
};
