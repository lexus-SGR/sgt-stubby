module.exports = {
  name: "setsubject",
  description: "Change group subject/name. (Admin only)",
  emoji: "📝",
  async execute(sock, msg, args) {
    if (!msg.key.remoteJid.endsWith("@g.us")) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Use this command in groups." });

    const isAdmin = (await sock.groupMetadata(msg.key.remoteJid)).participants.find(p => p.id === msg.key.participant).admin;
    if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Only admins can change group name." });

    const newSubject = args.join(" ");
    if (!newSubject) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Provide a new group name." });

    try {
      await sock.groupUpdateSubject(msg.key.remoteJid, newSubject);
      await sock.sendMessage(msg.key.remoteJid, { text: `✅ Group name changed to: ${newSubject}` });
    } catch {
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ Failed to change group name." });
    }
  }
};
