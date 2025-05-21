module.exports = {
  name: "hidetag",
  description: "Tag all group members secretly",
  category: "group",
  async execute(sock, msg, args, from, sender, groupMetadata, isGroupAdmin, isBotAdmin) {
    if (!groupMetadata || !groupMetadata.participants) {
      return sock.sendMessage(from, { text: "⛔ Group only command!" });
    }

    if (!isGroupAdmin && sender !== process.env.OWNER_JID) {
      return sock.sendMessage(from, { text: "⚠️ Only admins can use this command!" });
    }

    const participants = groupMetadata.participants.map(p => p.id);
    const message = args.join(" ") || "👀";

    await sock.sendMessage(from, {
      text: message,
      mentions: participants,
    });

    await sock.sendMessage(from, {
      react: {
        text: "🙈",
        key: msg.key,
      },
    });
  }
};
