const axios = require("axios");

module.exports = {
  name: "messi",
  description: "Send a random image of Lionel Messi",
  async execute(sock, msg, args, from) {
    await sock.sendMessage(from, {
      react: {
        text: "🐐",
        key: msg.key
      }
    });

    try {
      const res = await axios.get(`https://api.unsplash.com/photos/random?query=lionel messi&client_id=${process.env.UNSPLASH_KEY}`);
      await sock.sendMessage(from, {
        image: { url: res.data.urls.small },
        caption: "Lionel Messi - GOAT"
      }, { quoted: msg });
    } catch {
      await sock.sendMessage(from, { text: "Could not find Messi image." }, { quoted: msg });
    }
  }
};
