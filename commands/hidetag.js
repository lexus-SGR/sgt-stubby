module.exports = {
  name: "hidetag",
  description: "Send a hidden message mentioning all group members",
  emoji: "👻",
  async execute(sock, msg, args) {
    if (!msg.key.remoteJid.endsWith("@g.us")) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: "❌ This command only works in group chats.",
      });
    }

    const message = args.join(" ");
    if (!message) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: "✍️ Please provide a message to send."
      });
    }

    // React with emoji
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: "👻", key: msg.key }
    });

    const metadata = await sock.groupMetadata(msg.key.remoteJid);
    const members = metadata.participants.map(p => p.id);

    await sock.sendMessage(msg.key.remoteJid, {
      text: message,
      mentions: members
    });
  }
};
