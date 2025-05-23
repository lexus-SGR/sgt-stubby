const axios = require("axios");

module.exports = {
  name: "translate",
  description: "Translate text to English using AI.",
  emoji: "🌐",
  async execute(sock, msg, args) {
    await sock.sendMessage(msg.key.remoteJid, { react: { text: "🌐", key: msg.key } });

    const input = args.join(" ");
    if (!input) {
      return await sock.sendMessage(msg.key.remoteJid, { text: "❌ Please enter text to translate." });
    }

    try {
      const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-4",
        messages: [{ role: "user", content: `Translate this to English: ${input}` }],
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });

      const translated = response.data.choices[0].message.content.trim();
      await sock.sendMessage(msg.key.remoteJid, { text: `*🌐 Translated Text:*\n\n${translated}` });

    } catch (err) {
      console.error("Translate error:", err);
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ Translation failed. Try again." });
    }
  }
};
