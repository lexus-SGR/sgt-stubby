const ytdl = require('ytdl-core');
const fs = require('fs');

module.exports = {
  ytmp3: {
    name: "ytmp3",
    description: "Download YouTube audio (MP3).",
    emoji: "🎵",
    async execute(sock, msg, args) {
      if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: "Send YouTube link." });
      const url = args[0];
      if (!ytdl.validateURL(url)) return sock.sendMessage(msg.key.remoteJid, { text: "Invalid YouTube URL." });

      await sock.sendMessage(msg.key.remoteJid, { text: "Downloading audio..." });
      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title;
      const audioStream = ytdl(url, { filter: 'audioonly' });
      const path = `/tmp/${Date.now()}.mp3`;
      const stream = fs.createWriteStream(path);
      audioStream.pipe(stream);

      stream.on('finish', async () => {
        await sock.sendMessage(msg.key.remoteJid, {
          audio: { url: path },
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`
        });
        fs.unlink(path, () => {});
      });
    }
  },

  ytmp4: {
    name: "ytmp4",
    description: "Download YouTube video (MP4).",
    emoji: "🎬",
    async execute(sock, msg, args) {
      if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: "Send YouTube link." });
      const url = args[0];
      if (!ytdl.validateURL(url)) return sock.sendMessage(msg.key.remoteJid, { text: "Invalid YouTube URL." });

      await sock.sendMessage(msg.key.remoteJid, { text: "Downloading video..." });
      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title;
      const videoStream = ytdl(url, { quality: 'highestvideo' });
      const path = `/tmp/${Date.now()}.mp4`;
      const stream = fs.createWriteStream(path);
      videoStream.pipe(stream);

      stream.on('finish', async () => {
        await sock.sendMessage(msg.key.remoteJid, {
          video: { url: path },
          mimetype: 'video/mp4',
          fileName: `${title}.mp4`
        });
        fs.unlink(path, () => {});
      });
    }
  }
};
