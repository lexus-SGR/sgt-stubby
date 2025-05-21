const axios = require("axios");

module.exports = {
  name: "wiki",
  description: "Search Wikipedia for a term.",
  emoji: "📚",
  async execute(sock, msg, args) {
    await sock.sendMessage(msg.key.remoteJid, { react: { text: "📚", key: msg.key } });
    if (!args.length) return await sock.sendMessage(msg.key.remoteJid, { text: "Please provide a search term." });
    const query = args.join(" ");
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      const res = await axios.get(url);
      const extract = res.data.extract;
      const pageUrl = res.data.content_urls?.desktop?.page || "";
      await sock.sendMessage(msg.key.remoteJid, { text: `${extract}\n\nRead more: ${pageUrl}` });
    } catch {
      await sock.sendMessage(msg.key.remoteJid, { text: "No results found." });
    }
  }
};
