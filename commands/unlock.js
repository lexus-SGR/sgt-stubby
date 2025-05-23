module.exports = {
  name: "unlock",
  description: "Unlock group (all members can send messages).",
  emoji: "🔓",
  async execute(sock, msg) {
    if (!msg.key.remoteJid.endsWith("@g.us")) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Use in groups only." });

    const isAdmin = (await sock.groupMetadata(msg.key.remoteJid)).participants.find(p => p.id === msg.key.participant).admin;
    if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Only admins can unlock group." });

    try {
      await sock.groupSettingUpdate(msg.key.remoteJid, "not_announcement");
      await sock.sendMessage(msg.key.remoteJid, { text: "🔓 Group unlocked: Everyone can send messages." });
    } catch {
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ Failed to unlock group." });
    }
  }
};
