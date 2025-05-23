module.exports = {
  name: "kick",
  description: "Remove a member from the group. (Admin only)",
  emoji: "👢",
  async execute(sock, msg, args) {
    if (!msg.key.remoteJid.endsWith("@g.us")) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Use this command only in groups." });

    const isAdmin = (await sock.groupMetadata(msg.key.remoteJid)).participants.find(p => p.id === msg.key.participant).admin;
    if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: "❌ You must be an admin to use this." });

    const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid;
    if (!mentioned || mentioned.length === 0) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Tag a user to kick." });

    try {
      await sock.groupRemove(msg.key.remoteJid, mentioned);
      await sock.sendMessage(msg.key.remoteJid, { text: `✅ Removed: @${mentioned[0].split("@")[0]}`, mentions: mentioned });
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ Failed to remove member." });
    }
  }
};
