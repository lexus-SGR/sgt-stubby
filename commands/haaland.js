const axios = require("axios");

module.exports = {
  name: "haaland",
  description: "Send a random image of Erling Haaland",
  async execute(sock, msg, args, from) {
    await sock.sendMessage(from, {
      react: {
        text: "⚡",
        key: msg.key
      }
    });

    try {
      const res = await axios.get(`https://api.unsplash.com/photos/random?query=erling haaland&client_id=${process.env.UNSPLASH_KEY}`);
      await sock.sendMessage(from, {
        image: { url: res.data.urls.small },
        caption: "Erling Haaland - Power Forward"
      }, { quoted: msg });
    } catch {
      await sock.sendMessage(from, { text: "Couldn't find Haaland image." }, { quoted: msg });
    }
  }
};
