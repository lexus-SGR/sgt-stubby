module.exports = {
  name: "groupinfo",
  description: "Show info about this group.",
  emoji: "📊",
  async execute(sock, msg, args, isAdmin, isBotAdmin, groupMetadata) {
    if (!msg.key.remoteJid.endsWith("@g.us")) return;

    const info = `
*Group Info*
Name: ${groupMetadata.subject}
Participants: ${groupMetadata.participants.length}
Description: ${groupMetadata.desc || "None"}
Created: ${new Date(groupMetadata.creation * 1000).toLocaleString()}
    `;
    await sock.sendMessage(msg.key.remoteJid, { text: info, react: { text: "📊", key: msg.key } });
  }
};
