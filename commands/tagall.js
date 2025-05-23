module.exports = {
  name: "tagall",
  description: "Mention all group members in the group with a custom message",
  emoji: "📢",
  async execute(sock, msg, args) {
    if (!msg.key.remoteJid.endsWith("@g.us")) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: "❌ This command only works in group chats.",
      });
    }

    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: "📢", key: msg.key }
    });

    const message = args.join(" ");
    const metadata = await sock.groupMetadata(msg.key.remoteJid);
    const members = metadata.participants.map(p => p.id);

    let textToSend = message.length > 0 ? message : "📢 Tagging all members:";

    await sock.sendMessage(msg.key.remoteJid, {
      text: textToSend,
      mentions: members
    });
  }
};
