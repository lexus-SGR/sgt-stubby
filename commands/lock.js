module.exports = {
  name: "lock",
  description: "Lock group (only admins can send messages).",
  emoji: "🔒",
  async execute(sock, msg) {
    if (!msg.key.remoteJid.endsWith("@g.us")) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Use in groups only." });

    const isAdmin = (await sock.groupMetadata(msg.key.remoteJid)).participants.find(p => p.id === msg.key.participant).admin;
    if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Only admins can lock group." });

    try {
      await sock.groupSettingUpdate(msg.key.remoteJid, "announcement");
      await sock.sendMessage(msg.key.remoteJid, { text: "🔒 Group locked: Only admins can send messages." });
    } catch {
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ Failed to lock group." });
    }
  }
};
