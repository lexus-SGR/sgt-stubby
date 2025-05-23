module.exports = {
  name: "tagadmins",
  description: "Tag all admins in the group.",
  emoji: "👑",
  async execute(sock, msg) {
    if (!msg.key.remoteJid.endsWith("@g.us")) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Only in groups." });

    const metadata = await sock.groupMetadata(msg.key.remoteJid);
    const admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id);

    if (admins.length === 0) return sock.sendMessage(msg.key.remoteJid, { text: "No admins found." });

    await sock.sendMessage(msg.key.remoteJid, {
      text: "Tagging all admins:",
      mentions: admins
    });
  }
};
