const axios = require("axios");

module.exports = {
  name: "onana",
  description: "Send a random image of André Onana",
  async execute(sock, msg, args, from) {
    await sock.sendMessage(from, {
      react: {
        text: "🧤",
        key: msg.key
      }
    });

    try {
      const res = await axios.get(`https://api.unsplash.com/photos/random?query=andre onana&client_id=${process.env.UNSPLASH_KEY}`);
      await sock.sendMessage(from, {
        image: { url: res.data.urls.small },
        caption: "André Onana - Top Goalkeeper"
      }, { quoted: msg });
    } catch {
      await sock.sendMessage(from, { text: "Could not find Onana image." }, { quoted: msg });
    }
  }
};
