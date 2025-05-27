module.exports = {
  name: "kiss",
  description: "Blow a kiss to someone",
  category: "fun",
  react: "💋",
  usage: "kiss @user",
  async execute(sock, msg, args, from, sender) {
    const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mention) return sock.sendMessage(from, { text: "Please mention someone to kiss." }, { quoted: msg });

    await sock.sendMessage(from, {
      text: `💋 @${sender.split("@")[0]} sent a kiss to @${mention.split("@")[0]}!`,
      mentions: [sender, mention]
    }, { quoted: msg });
  }
}
