const ytSearch = require('yt-search');

module.exports = {
  name: "searchmusic",
  description: "Search for a song on YouTube",
  emoji: "🔎",
  async execute(sock, msg, args) {
    if (!args.length) return sock.sendMessage(msg.key.remoteJid, { text: "Tuma jina la wimbo, mfano: `!searchmusic jux enjoy`" });

    const query = args.join(" ");
    const results = await ytSearch(query);

    if (!results.videos.length) {
      return sock.sendMessage(msg.key.remoteJid, { text: "Hakuna matokeo yaliyopatikana." });
    }

    let text = "🔍 *Matokeo ya Utafutaji:*\n\n";
    results.videos.slice(0, 5).forEach((video, i) => {
      text += `${i + 1}. ${video.title}\n${video.url}\n\n`;
    });

    sock.sendMessage(msg.key.remoteJid, { text });
  }
};
