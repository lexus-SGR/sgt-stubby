module.exports = {
  name: "kick",
  description: "Remove a user from the group.",
  emoji: "🥾",
  async execute(sock, msg, args, isAdmin, isBotAdmin, groupMetadata) {
    if (!msg.key.remoteJid.endsWith("@g.us")) return;
    if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: "You must be an admin to use this." });
    if (!isBotAdmin) return sock.sendMessage(msg.key.remoteJid, { text: "Bot needs admin rights to kick." });

    const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned || mentioned.length === 0) return sock.sendMessage(msg.key.remoteJid, { text: "Tag the user to kick." });

    await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, "remove");
    await sock.sendMessage(msg.key.remoteJid, { text: `Kicked ${mentioned[0]}`, react: { text: "🥾", key: msg.key } });
  }
};
