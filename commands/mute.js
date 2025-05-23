module.exports = {
  name: "mute",
  description: "Mute the group for members (only admins can talk).",
  emoji: "🔇",
  async execute(sock, msg) {
    if (!msg.key.remoteJid.endsWith("@g.us")) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Use in groups only." });

    const isAdmin = (await sock.groupMetadata(msg.key.remoteJid)).participants.find(p => p.id === msg.key.participant).admin;
    if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Only admins can mute the group." });

    try {
      await sock.groupSettingUpdate(msg.key.remoteJid, "announcement");
      await sock.sendMessage(msg.key.remoteJid, { text: "✅ Group has been muted (only admins can send messages)." });
    } catch {
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ Failed to mute group." });
    }
  }
};
