module.exports = {
  name: "antidelete",
  async execute(sock, msg, args, context) {
    const { antiDeleteGroups } = context;
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, { text: "❌ This command is only for groups." });
    }

    const action = args[0];
    if (!["on", "off"].includes(action)) {
      return sock.sendMessage(from, {
        text: "Usage: !antidelete [on/off]"
      });
    }

    antiDeleteGroups[from] = {
      enabled: action === "on"
    };

    await sock.sendMessage(from, {
      text: `✅ Anti-delete has been turned *${action}* by *@${sender.split("@")[0]}*.`,
      mentions: [sender]
    });
  }
};
