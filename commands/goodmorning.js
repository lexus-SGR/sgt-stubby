module.exports = {
  name: "goodmorning",
  description: "Say good morning",
  category: "fun",
  react: "☀️",
  usage: "goodmorning",
  async execute(sock, msg, args, from, sender) {
    await sock.sendMessage(from, {
      text: `☀️ Good morning, @${sender.split("@")[0]}! Have a great day.`,
      mentions: [sender]
    }, { quoted: msg });
  }
}
