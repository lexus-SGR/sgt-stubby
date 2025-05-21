const axios = require("axios");

module.exports = {
  name: "quote",
  description: "Get an inspirational quote.",
  emoji: "💬",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, { react: { text: "💬", key: msg.key } });
    try {
      const response = await axios.get("https://api.quotable.io/random");
      const quote = `"${response.data.content}"\n- ${response.data.author}`;
      await sock.sendMessage(msg.key.remoteJid, { text: quote });
    } catch {
      await sock.sendMessage(msg.key.remoteJid, { text: "Sorry, couldn't fetch a quote now." });
    }
  }
};
