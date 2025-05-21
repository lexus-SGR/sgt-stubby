module.exports = {
  name: "help",
  description: "Show list of available commands.",
  emoji: "❓",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, { react: { text: "❓", key: msg.key } });

    const commandsList = [
      "ping - Check if bot is alive",
      "owner - Get owner's contact info",
      "help - Show this help message",
      "joke - Get a random joke",
      "quote - Get an inspirational quote",
      "weather <city> - Get weather info",
      "time - Get current time",
      "about - About this bot",
      "sticker - Convert image to sticker",
      "translate <lang> <text> - Translate text",
      "wiki <term> - Search Wikipedia",
      "calc <expression> - Calculate math expression",
      "remind <time> <msg> - Set reminder",
      "echo <text> - Repeat your text",
      "quote - Get a random quote",
      "fact - Get a random fact",
      "news - Get latest news headlines",
      "covid <country> - Get COVID stats",
      "translate <lang> <text> - Translate text",
      "joke - Get a random joke"
    ];

    await sock.sendMessage(msg.key.remoteJid, {
      text: "📜 *Available Commands:*\n" + commandsList.join("\n")
    });
  }
};
