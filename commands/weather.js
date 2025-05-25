const axios = require("axios");

const weather = {
  name: "weather",
  description: "Angalia hali ya hewa ya jiji lolote",
  emoji: "🌤",
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    if (!args[0]) {
      return await sock.sendMessage(from, {
        text: "⚠️ Tafadhali andika jiji. Mfano: !weather Arusha",
      }, { quoted: msg });
    }

    const city = args.join(" ");
    const apiKey = "1536f6a7be04b8ad50d09f6228f6ff4e"; // API key yako
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=sw`;

    try {
      const { data } = await axios.get(url);
      const info = `
🌤 *Hali ya Hewa - ${data.name}*
├─ Hali: ${data.weather[0].description}
├─ Joto: ${data.main.temp}°C
├─ Hisia: ${data.main.feels_like}°C
├─ Unyevu: ${data.main.humidity}%
├─ Upepo: ${data.wind.speed} m/s
╰─ Nchi: ${data.sys.country}
      `.trim();

      await sock.sendMessage(from, { text: info }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(from, {
        text: "⚠️ Samahani, siwezi kupata hali ya hewa ya jiji hilo. Hakikisha umeandika jina sahihi.",
      }, { quoted: msg });
    }
  },
};

module.exports = weather;
