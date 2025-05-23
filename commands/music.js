const yts = require("yt-search");
const ytdl = require("ytdl-core");

module.exports = {
  name: "music",
  description: "Search and download music from YouTube",
  async execute(sock, msg, args) {
    if (!args.length) {
      return sock.sendMessage(msg.key.remoteJid, { text: "Please enter the name of the song." });
    }

    const query = args.join(" ");
    const search = await yts(query);
    const video = search.videos[0];
    if (!video) {
      return sock.sendMessage(msg.key.remoteJid, { text: "No results found." });
    }

    const stream = ytdl(video.url, { filter: "audioonly" });

    sock.sendMessage(msg.key.remoteJid, {
      audio: { stream },
      mimetype: "audio/mp4",
      ptt: false
    }, { quoted: msg });
  }
};
