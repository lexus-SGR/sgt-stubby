const axios = require("axios");

module.exports = {
  name: "news",
  description: "Get latest news headlines.",
  emoji: "📰",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, { react: { text: "📰", key: msg.key } });
    try {
      const apiKey = "your_newsapi_key_here"; // replace with your NewsAPI key
      const res = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`);
      const articles = res.data.articles.slice(0, 5);
      let newsText = "📰 *Latest News Headlines:*\n\n";
      articles.forEach((a, i) => {
        newsText += `${i + 1}. ${a.title}\n${a.url}\n\n`;
      });
      await sock.sendMessage(msg.key.remoteJid, { text: newsText });
    } catch {
      await sock.sendMessage(msg.key.remoteJid, { text: "Failed to fetch news." });
    }
  }
};
