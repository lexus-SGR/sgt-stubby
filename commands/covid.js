const axios = require("axios");

module.exports = {
  name: "covid",
  description: "Get COVID-19 stats for a country.",
  emoji: "🦠",
  async execute(sock, msg, args) {
    await sock.sendMessage(msg.key.remoteJid, { react: { text: "🦠", key: msg.key } });
    if (!args.length) return await sock.sendMessage(msg.key.remoteJid, { text: "Please provide a country name." });
    const country = args.join(" ");
    try {
      const res = await axios.get(`https://disease.sh/v3/covid-19/countries/${encodeURIComponent(country)}`);
      const data = res.data;
      const stats = `COVID-19 Stats for ${data.country}:\nCases: ${data.cases}\nDeaths: ${data.deaths}\nRecovered: ${data.recovered}\nActive: ${data.active}`;
      await sock.sendMessage(msg.key.remoteJid, { text: stats });
    } catch {
      await sock.sendMessage(msg.key.remoteJid, { text: "Country not found or error fetching data." });
    }
  }
};
