module.exports = {
  name: "goodnight",
  description: "Say goodnight",
  category: "fun",
  react: "🌙",
  usage: "goodnight",
  async execute(sock, msg, args, from, sender) {
    await sock.sendMessage(from, {
      text: `🌙 Good night, @${sender.split("@")[0]}! Sleep tight.`,
      mentions: [sender]
    }, { quoted: msg });
  }
}
