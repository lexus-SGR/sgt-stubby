module.exports = {
  name: "sticker",
  description: "Convert image to sticker (send an image with caption !sticker).",
  emoji: "🖼️",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, { react: { text: "🖼️", key: msg.key } });
    try {
      const imageMessage = msg.message.imageMessage || msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
      if (!imageMessage) return await sock.sendMessage(msg.key.remoteJid, { text: "Please reply to an image with this command." });

      const buffer = await sock.downloadMediaMessage(msg);
      await sock.sendMessage(msg.key.remoteJid, { sticker: { url: buffer } });
    } catch {
      await sock.sendMessage(msg.key.remoteJid, { text: "Failed to create sticker." });
    }
  }
};
