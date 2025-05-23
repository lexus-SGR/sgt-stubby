const axios = require("axios");

module.exports = {
  name: "ronaldo",
  description: "Send a random image of Cristiano Ronaldo",
  async execute(sock, msg, args, from) {
    await sock.sendMessage(from, {
      react: {
        text: "🔥",
        key: msg.key
      }
    });

    try {
      const res = await axios.get(`https://api.unsplash.com/photos/random?query=cristiano ronaldo&client_id=${process.env.UNSPLASH_KEY}`);
      await sock.sendMessage(from, {
        image: { url: res.data.urls.small },
        caption: "Cristiano Ronaldo - Legend"
      }, { quoted: msg });
    } catch {
      await sock.sendMessage(from, { text: "Could not find Ronaldo image." }, { quoted: msg });
    }
  }
};
