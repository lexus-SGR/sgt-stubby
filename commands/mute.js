module.exports = {
  name: "mute",
  description: "Pretend to mute a member via reply (fake).",
  emoji: "🔇",
  async execute(sock, msg) {
    const jid = msg.key.remoteJid;
    const replyUser = msg.message?.extendedTextMessage?.contextInfo?.participant;

    if (!jid.endsWith("@g.us"))
      return sock.sendMessage(jid, { text: "🔇 Group only command." });

    if (!replyUser)
      return sock.sendMessage(jid, { text: "🧾 Reply to mute someone." });

    await sock.sendMessage(jid, {
      text: `🔇 @${replyUser.split("@")[0]} has been *muted*. They can no longer send messages (just kidding 😄)`,
      mentions: [replyUser]
    });
  }
};
