const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "ronaldo",
  description: "Download and send a random image of Cristiano Ronaldo",
  async execute(sock, msg, args, from) {
    const accessKey = "3_ZLDJCDvk4xsHStdG5K_E4az24833uZPMtcY34BBUc"; // Unsplash Access Key

    await sock.sendMessage(from, {
      react: { text: "🔥", key: msg.key }
    });

    try {
      const res = await axios.get(`https://api.unsplash.com/photos/random?query=cristiano ronaldo&client_id=${accessKey}`);
      const imageUrl = res.data.urls.full;

      const tempFilePath = path.resolve(__dirname, "../media/ronaldo.jpg");
      const writer = fs.createWriteStream(tempFilePath);
      const imageResponse = await axios.get(imageUrl, { responseType: "stream" });
      imageResponse.data.pipe(writer);

      writer.on("finish", async () => {
        await sock.sendMessage(from, {
          image: fs.readFileSync(tempFilePath),
          mimetype: "image/jpeg",
          fileName: "cristiano_ronaldo.jpg",
          caption: "Cristiano Ronaldo - Legend"
        }, { quoted: msg });

        fs.unlinkSync(tempFilePath); // Delete file after sending
      });

      writer.on("error", async () => {
        await sock.sendMessage(from, { text: "❌ Failed to download Ronaldo image." }, { quoted: msg });
      });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: "❌ Couldn't fetch Ronaldo image." }, { quoted: msg });
    }
  }
};
