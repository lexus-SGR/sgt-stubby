module.exports = {
  name: "setdesc",
  description: "Change group description. (Admin only)",
  emoji: "📝",
  async execute(sock, msg, args) {
    if (!msg.key.remoteJid.endsWith("@g.us")) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Use this command in groups." });

    const isAdmin = (await sock.groupMetadata(msg.key.remoteJid)).participants.find(p => p.id === msg.key.participant).admin;
    if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Only admins can change group description." });

    const newDesc = args.join(" ");
    if (!newDesc) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Provide a new description." });

    try {
      await sock.groupUpdateDescription(msg.key.remoteJid, newDesc);
      await sock.sendMessage(msg.key.remoteJid, { text: `✅ Group description updated.` });
    } catch {
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ Failed to update group description." });
    }
  }
};
