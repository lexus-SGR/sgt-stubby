module.exports = {
  name: "sad",
  description: "Show you're feeling sad",
  category: "fun",
  react: "😢",
  usage: "sad",
  async execute(sock, msg, args, from, sender) {
    await sock.sendMessage(from, {
      text: `😢 @${sender.split("@")[0]} is feeling very sad today.`,
      mentions: [sender]
    }, { quoted: msg });
  }
}
