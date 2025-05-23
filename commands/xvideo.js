const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  name: "xvideo",
  description: "Search Xvideos using keywords",
  async execute(sock, msg, args) {
    if (!args.length) {
      return sock.sendMessage(msg.key.remoteJid, { text: "Please enter a search keyword. Example: school girl" });
    }

    const query = args.join(" ");
    const res = await axios.get(`https://www.xvideos.com/?k=${encodeURIComponent(query)}`);
    const $ = cheerio.load(res.data);
    const results = [];

    $("div.thumb-block").each((i, el) => {
      const title = $(el).find("p a").text().trim();
      const link = "https://www.xvideos.com" + $(el).find("p a").attr("href");
      if (title && link) results.push(`*${title}*\n${link}`);
    });

    if (!results.length) {
      return sock.sendMessage(msg.key.remoteJid, { text: "No results found." });
    }

    sock.sendMessage(msg.key.remoteJid, { text: results.slice(0, 5).join("\n\n") });
  }
};
