module.exports = {
  name: "slap",
  description: "Slap someone playfully",
  category: "fun",
  react: "👋",
  usage: "slap @user",
  async execute(sock, msg, args, from, sender) {
    const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mention) return sock.sendMessage(from, { text: "Mention someone to slap!" }, { quoted: msg });

    await sock.sendMessage(from, {
      text: `👋 @${sender.split("@")[0]} just slapped @${mention.split("@")[0]}!`,
      mentions: [sender, mention]
    }, { quoted: msg });
  }
}
