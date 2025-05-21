module.exports = {
  name: "promote",
  description: "Promote a user to admin.",
  emoji: "⬆️",
  async execute(sock, msg, args, isAdmin, isBotAdmin) {
    if (!msg.key.remoteJid.endsWith("@g.us")) return;
    if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: "Only admins can promote others." });
    if (!isBotAdmin) return sock.sendMessage(msg.key.remoteJid, { text: "Bot must be admin to promote users." });

    const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned || mentioned.length === 0) return sock.sendMessage(msg.key.remoteJid, { text: "Tag a user to promote." });

    await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, "promote");
    await sock.sendMessage(msg.key.remoteJid, { text: `Promoted ${mentioned[0]}`, react: { text: "⬆️", key: msg.key } });
  }
};
