const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "haaland",
  description: "Download and send a random image of Erling Haaland",
  async execute(sock, msg, args, from) {
    const accessKey = "3_ZLDJCDvk4xsHStdG5K_E4az24833uZPMtcY34BBUc"; // Your Unsplash Access Key

    await sock.sendMessage(from, {
      react: { text: "⚡", key: msg.key }
    });

    try {
      const res = await axios.get(`https://api.unsplash.com/photos/random?query=erling haaland&client_id=${accessKey}`);
      const imageUrl = res.data.urls.full;

      // Download image to temp file
      const tempFilePath = path.resolve(__dirname, `../media/haaland.jpg`);
      const writer = fs.createWriteStream(tempFilePath);
      const imageResponse = await axios.get(imageUrl, { responseType: "stream" });
      imageResponse.data.pipe(writer);

      writer.on("finish", async () => {
        await sock.sendMessage(from, {
          image: fs.readFileSync(tempFilePath),
          mimetype: "image/jpeg",
          fileName: "erling_haaland.jpg",
          caption: "Here is a powerful Erling Haaland image for you!"
        }, { quoted: msg });

        fs.unlinkSync(tempFilePath); // delete file after sending
      });

      writer.on("error", async () => {
        await sock.sendMessage(from, { text: "❌ Failed to download the image." }, { quoted: msg });
      });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: "❌ Couldn't fetch Haaland image." }, { quoted: msg });
    }
  }
};
