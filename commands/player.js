const axios = require("axios");

module.exports = {
  name: "player",
  description: "Search and send a photo of a football player",
  async execute(sock, msg, args, from) {
    const playerName = args.join(" ");
    if (!playerName) {
      return await sock.sendMessage(from, { text: "Please provide a player name." }, { quoted: msg });
    }

    try {
      // Emoji reaction
      await sock.sendMessage(from, {
        react: {
          text: "⚽", // Emoji ya mpira
          key: msg.key
        }
      });

      const res = await axios.get(`https://api.unsplash.com/photos/random?query=${playerName}&client_id=${process.env.UNSPLASH_KEY}`);
      const imageUrl = res.data.urls.small;

      await sock.sendMessage(from, {
        image: { url: imageUrl },
        caption: `Here is a photo of ${playerName}`
      }, { quoted: msg });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: "Could not find image." }, { quoted: msg });
    }
  }
};
