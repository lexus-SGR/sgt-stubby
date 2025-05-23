const axios = require("axios");

module.exports = {
  name: "aiwrite",
  description: "Let AI help you write an article or paragraph.",
  emoji: "✒️",
  async execute(sock, msg, args) {
    await sock.sendMessage(msg.key.remoteJid, { react: { text: "✒️", key: msg.key } });

    const topic = args.join(" ");
    if (!topic) {
      return await sock.sendMessage(msg.key.remoteJid, { text: "❌ Please give me a topic to write about." });
    }

    try {
      const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-4",
        messages: [{ role: "user", content: `Write a detailed paragraph about: ${topic}` }],
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });

      const article = response.data.choices[0].message.content.trim();
      await sock.sendMessage(msg.key.remoteJid, { text: `*✒️ AI Written Content:*\n\n${article}` });

    } catch (err) {
      console.error("AI write error:", err);
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ AI writing failed." });
    }
  }
};
