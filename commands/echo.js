module.exports = {
  name: "echo",
  description: "Repeat your text or a replied message.",
  emoji: "🗣️",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    await sock.sendMessage(from, {
      react: { text: "🗣️", key: msg.key }
    });

    let text;

    if (args.length > 0) {
      text = args.join(" ");
    } else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
      const messageType = Object.keys(quoted)[0];
      text = quoted[messageType]?.text || "Echoing your reply.";
    } else {
      return await sock.sendMessage(from, {
        text: "❗ Please provide text or reply to a message.",
        quoted: msg
      });
    }

    await sock.sendMessage(from, { text, quoted: msg });
  }
};
