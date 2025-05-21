const axios = require("axios");

module.exports = {
  name: "joke",
  description: "Get a random joke.",
  emoji: "😂",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, { react: { text: "😂", key: msg.key } });
    try {
      const response = await axios.get("https://official-joke-api.appspot.com/jokes/random");
      const joke = `${response.data.setup}\n${response.data.punchline}`;
      await sock.sendMessage(msg.key.remoteJid, { text: joke });
    } catch {
      await sock.sendMessage(msg.key.remoteJid, { text: "Sorry, couldn't get a joke now." });
    }
  }
};
