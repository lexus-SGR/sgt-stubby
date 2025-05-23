let nsfwGroups = new Set();

module.exports = {
  name: "nsfw",
  description: "Toggle NSFW content in group. (Admin only)",
  emoji: "🔞",
  async execute(sock, msg) {
    if (!msg.key.remoteJid.endsWith("@g.us")) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Only groups." });
    
    const isAdmin = (await sock.groupMetadata(msg.key.remoteJid)).participants.find(p => p.id === msg.key.participant).admin;
    if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Only admins can toggle NSFW." });
    
    if (nsfwGroups.has(msg.key.remoteJid)) {
      nsfwGroups.delete(msg.key.remoteJid);
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ NSFW content disabled." });
    } else {
      nsfwGroups.add(msg.key.remoteJid);
      await sock.sendMessage(msg.key.remoteJid, { text: "✅ NSFW content enabled." });
    }
  }
};
