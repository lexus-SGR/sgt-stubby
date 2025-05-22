const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "playmusic",
  description: "Play and send music audio from YouTube",
  emoji: "🎶",
  async execute(sock, msg, args) {
    if (!args.length) return sock.sendMessage(msg.key.remoteJid, { text: "Tuma jina la wimbo, mfano: `!playmusic diamond jeje`" });

    const query = args.join(" ");
    const results = await ytSearch(query);
    const video = results.videos[0];

    if (!video) return sock.sendMessage(msg.key.remoteJid, { text: "Hakuna matokeo yaliyopatikana." });

    const stream = ytdl(video.url, { filter: 'audioonly' });
    const filePath = path.join(__dirname, `${video.videoId}.mp3`);
    const writeStream = fs.createWriteStream(filePath);

    stream.pipe(writeStream);

    writeStream.on("finish", async () => {
      await sock.sendMessage(msg.key.remoteJid, {
        audio: { url: filePath },
        mimetype: "audio/mp4"
      });

      // Delete the file after sending
      fs.unlinkSync(filePath);
    });

    writeStream.on("error", () => {
      sock.sendMessage(msg.key.remoteJid, { text: "Kuna hitilafu kwenye kupakua audio." });
    });
  }
};
