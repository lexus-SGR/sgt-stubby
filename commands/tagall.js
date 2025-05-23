module.exports = {
  name: "tagall",
  description: "Mention all group members in the group",
  emoji: "📢",
  async execute(sock, msg) {
    if (!msg.key.remoteJid.endsWith("@g.us")) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: "❌ This command only works in group chats.",
      });
    }

    // React with emoji
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: "📢", key: msg.key }
    });

    const metadata = await sock.groupMetadata(msg.key.remoteJid);
    const members = metadata.participants.map(p => p.id);

    let mentionText = "*📢 Tagging all members:*\n\n";
    mentionText += members.map(m => `@${m.split("@")[0]}`).join("\n");

    await sock.sendMessage(msg.key.remoteJid, {
      text: mentionText,
      mentions: members
    });
  }
};
