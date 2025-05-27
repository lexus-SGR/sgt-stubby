module.exports = {
  name: "cry",
  description: "Express sadness with a cry",
  category: "fun",
  react: "😭",
  usage: "cry",
  async execute(sock, msg, args, from, sender) {
    await sock.sendMessage(from, {
      text: `😭 Aww... @${sender.split("@")[0]} is crying...`,
      mentions: [sender]
    }, { quoted: msg });
  }
}
