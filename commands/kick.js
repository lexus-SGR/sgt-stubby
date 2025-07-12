module.exports = {
  name: "kick",
  description: "Kick a member by replying to their message.",
  emoji: "🚪",
  async execute(sock, msg) {
    const jid = msg.key.remoteJid;
    const isGroup = jid.endsWith("@g.us");
    if (!isGroup) return await sock.sendMessage(jid, { text: "❌ Group only command." });

    const replyUser = msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!replyUser) return await sock.sendMessage(jid, { text: "✋ Please reply to the user's message to kick them." });

    await sock.groupParticipantsUpdate(jid, [replyUser], "remove");
    await sock.sendMessage(jid, {
      text: `🚪 @${replyUser.split("@")[0]} has been *removed* from the group.`,
      mentions: [replyUser]
    });
  }
};
