module.exports = {
  name: "invite",
  description: "Get the group invite link. (Admin only)",
  emoji: "🔗",
  async execute(sock, msg) {
    if (!msg.key.remoteJid.endsWith("@g.us")) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Only in groups." });

    const isAdmin = (await sock.groupMetadata(msg.key.remoteJid)).participants.find(p => p.id === msg.key.participant).admin;
    if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Only admins can get invite link." });

    try {
      const inviteCode = await sock.groupInviteCode(msg.key.remoteJid);
      const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
      await sock.sendMessage(msg.key.remoteJid, { text: `🔗 Group invite link:\n${inviteLink}` });
    } catch {
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ Failed to get invite link." });
    }
  }
};
