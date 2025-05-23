module.exports = {
  name: "delete",
  description: "Delete a message sent by the bot. (Reply to the message to delete)",
  emoji: "🗑️",
  async execute(sock, msg) {
    if (!msg.message.extendedTextMessage?.contextInfo?.stanzaId) {
      return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Please reply to a message sent by the bot to delete." });
    }

    const key = {
      remoteJid: msg.key.remoteJid,
      fromMe: true,
      id: msg.message.extendedTextMessage.contextInfo.stanzaId,
      participant: msg.key.participant
    };

    try {
      await sock.sendMessage(msg.key.remoteJid, { delete: key });
    } catch {
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ Failed to delete the message." });
    }
  }
};
