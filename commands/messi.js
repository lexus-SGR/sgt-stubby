const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "messi",
  description: "Download and send a random image of Lionel Messi",
  async execute(sock, msg, args, from) {
    const accessKey = "3_ZLDJCDvk4xsHStdG5K_E4az24833uZPMtcY34BBUc"; // Unsplash Access Key

    await sock.sendMessage(from, {
      react: { text: "🐐", key: msg.key }
    });

    try {
      const res = await axios.get(`https://api.unsplash.com/photos/random?query=lionel messi&client_id=${accessKey}`);
      const imageUrl = res.data.urls.full;

      const tempFilePath = path.resolve(__dirname, "../media/messi.jpg");
      const writer = fs.createWriteStream(tempFilePath);
      const imageResponse = await axios.get(imageUrl, { responseType: "stream" });
      imageResponse.data.pipe(writer);

      writer.on("finish", async () => {
        await sock.sendMessage(from, {
          image: fs.readFileSync(tempFilePath),
          mimetype: "image/jpeg",
          fileName: "lionel_messi.jpg",
          caption: "Lionel Messi - GOAT"
        }, { quoted: msg });

        fs.unlinkSync(tempFilePath);
      });

      writer.on("error", async () => {
        await sock.sendMessage(from, { text: "❌ Failed to download the image." }, { quoted: msg });
      });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: "❌ Couldn't fetch Messi image." }, { quoted: msg });
    }
  }
};
