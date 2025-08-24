module.exports = {
  name: "hidetag",
  description: "Silently mention everyone in the group.",
  emoji: "🎉",
  async execute(sock, msg) {
    const jid = msg.key.remoteJid;

    // Lazima iwe group
    if (!jid.endsWith("@g.us")) {
      return await sock.sendMessage(jid, {
        text: "❌ This command only works in group chats."
      });
    }

    // Chukua ujumbe aliotuma
    const messageText =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text;

    if (!messageText) {
      return await sock.sendMessage(jid, {
        text: "📩 Tafadhali andika ujumbe baada ya !hidetag"
      });
    }

    try {
      // Chukua namba za participants wote
      const groupMetadata = await sock.groupMetadata(jid);
      const members = groupMetadata.participants.map(p => p.id);

      // Tuma ujumbe unaowamention wote kimya kimya
      await sock.sendMessage(jid, {
        text: `🎉 *Broadcast (ommy-md):*\n${messageText}`,
        mentions: members
      });

    } catch (e) {
      await sock.sendMessage(jid, {
        text: "⚠️ Unable to fetch members. Make sure bot is *admin* in this group."
      });
    }
  }
};
