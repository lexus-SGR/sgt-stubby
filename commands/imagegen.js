const axios = require("axios");

module.exports = {
  name: "imagegen",
  description: "Generate an AI image from text prompt.",
  emoji: "🎨",
  async execute(sock, msg, args) {
    try {
      await sock.sendMessage(msg.key.remoteJid, { react: { text: "🎨", key: msg.key } });

      const prompt = args.join(" ");
      if (!prompt) {
        return await sock.sendMessage(msg.key.remoteJid, { text: "❌ Please provide a prompt to generate an image." });
      }

      const response = await axios.post("https://api.openai.com/v1/images/generations", {
        prompt,
        n: 1,
        size: "512x512"
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });

      const imageUrl = response.data.data[0].url;

      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: imageUrl },
        caption: `*🎨 Generated Image:*\n${prompt}`
      });

    } catch (err) {
      console.error("imagegen error:", err);
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ Failed to generate image. Try again later." });
    }
  }
};
