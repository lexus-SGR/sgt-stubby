const axios = require("axios");

module.exports = {
  name: "summarize",
  description: "Summarize a long paragraph using AI.",
  emoji: "✍️",
  async execute(sock, msg, args) {
    await sock.sendMessage(msg.key.remoteJid, { react: { text: "✍️", key: msg.key } });

    const input = args.join(" ");
    if (!input) {
      return await sock.sendMessage(msg.key.remoteJid, { text: "❌ Please provide text to summarize." });
    }

    try {
      const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-4",
        messages: [{ role: "user", content: `Summarize this: ${input}` }],
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });

      const summary = response.data.choices[0].message.content.trim();
      await sock.sendMessage(msg.key.remoteJid, { text: `*✍️ Summary:*\n\n${summary}` });

    } catch (err) {
      console.error("Summarize error:", err);
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ Could not summarize the text." });
    }
  }
};
