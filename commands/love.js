module.exports = {
  name: "love",
  description: "Send some love",
  category: "fun",
  react: "❤️",
  usage: "love",
  async execute(sock, msg, args, from, sender) {
    await sock.sendMessage(from, {
      text: `❤️ @${sender.split("@")[0]} is sending love to everyone!`,
      mentions: [sender]
    }, { quoted: msg });
  }
}
