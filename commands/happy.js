module.exports = {
  name: "happy",
  description: "Express your happiness",
  category: "fun",
  react: "😊",
  usage: "happy",
  async execute(sock, msg, args, from, sender) {
    await sock.sendMessage(from, {
      text: `😊 Yay! @${sender.split("@")[0]} is feeling happy!`,
      mentions: [sender]
    }, { quoted: msg });
  }
}
