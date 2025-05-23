const axios = require("axios");

module.exports = {
  name: "neymar",
  description: "Send a random image of Neymar Jr",
  async execute(sock, msg, args, from) {
    await sock.sendMessage(from, {
      react: {
        text: "🕺",
        key: msg.key
      }
    });

    try {
      const res = await axios.get(`https://api.unsplash.com/photos/random?query=neymar&client_id=${process.env.UNSPLASH_KEY}`);
      await sock.sendMessage(from, {
        image: { url: res.data.urls.small },
        caption: "Neymar Jr - Skill Master"
      }, { quoted: msg });
    } catch {
      await sock.sendMessage(from, { text: "Couldn't find Neymar image." }, { quoted: msg });
    }
  }
};
