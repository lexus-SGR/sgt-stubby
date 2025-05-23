// Assuming you have a global variable or database to store the welcome status per group
// For simplicity, this is a dummy example toggling welcome on/off

let welcomeGroups = new Set();

module.exports = {
  name: "welcome",
  description: "Toggle welcome messages in the group. (Admin only)",
  emoji: "👋",
  async execute(sock, msg) {
    if (!msg.key.remoteJid.endsWith("@g.us")) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Only groups." });

    const isAdmin = (await sock.groupMetadata(msg.key.remoteJid)).participants.find(p => p.id === msg.key.participant).admin;
    if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Only admins can toggle welcome messages." });

    if (welcomeGroups.has(msg.key.remoteJid)) {
      welcomeGroups.delete(msg.key.remoteJid);
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ Welcome messages disabled." });
    } else {
      welcomeGroups.add(msg.key.remoteJid);
      await sock.sendMessage(msg.key.remoteJid, { text: "✅ Welcome messages enabled." });
    }
  }
};
