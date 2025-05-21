module.exports = {
  name: "demote",
  description: "Demote an admin to member.",
  emoji: "⬇️",
  async execute(sock, msg, args, isAdmin, isBotAdmin) {
    if (!msg.key.remoteJid.endsWith("@g.us")) return;
    if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: "Only admins can demote others." });
    if (!isBotAdmin) return sock.sendMessage(msg.key.remoteJid, { text: "Bot must be admin to demote users." });

    const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned || mentioned.length === 0) return sock.sendMessage(msg.key.remoteJid, { text: "Tag a user to demote." });

    await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, "demote");
    await sock.sendMessage(msg.key.remoteJid, { text: `Demoted ${mentioned[0]}`, react: { text: "⬇️", key: msg.key } });
  }
};
