const axios = require("axios");

module.exports = {
  name: "mbappe",
  description: "Send a random image of Kylian Mbappé",
  async execute(sock, msg, args, from) {
    await sock.sendMessage(from, {
      react: {
        text: "🚀",
        key: msg.key
      }
    });

    try {
      const res = await axios.get(`https://api.unsplash.com/photos/random?query=kylian mbappe&client_id=${process.env.UNSPLASH_KEY}`);
      await sock.sendMessage(from, {
        image: { url: res.data.urls.small },
        caption: "Kylian Mbappé - Speed Demon"
      }, { quoted: msg });
    } catch {
      await sock.sendMessage(from, { text: "Couldn't find Mbappé image." }, { quoted: msg });
    }
  }
};
