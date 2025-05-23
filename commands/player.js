const axios = require("axios");

module.exports = {
  name: "player",
  description: "Get an image of a football player",
  async execute(sock, msg, args) {
    await sock.sendMessage(msg.key.remoteJid, {
      react: {
        text: "⚽",
        key: msg.key,
      },
    });

    if (!args.length) {
      return sock.sendMessage(msg.key.remoteJid, { text: "Please enter the name of the football player." });
    }

    const query = args.join(" ");
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=YOUR_UNSPLASH_API_KEY`;

    try {
      const res = await axios.get(url);
      const photo = res.data.results[0];
      if (!photo) {
        return sock.sendMessage(msg.key.remoteJid, { text: "No image found." });
      }

      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: photo.urls.regular },
        caption: `*${query}*`
      }, { quoted: msg });
    } catch (err) {
      console.error(err);
      sock.sendMessage(msg.key.remoteJid, { text: "An error occurred while fetching the image." });
    }
  }
};
