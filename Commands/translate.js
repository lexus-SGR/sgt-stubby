
const translate = require("@vitalets/google-translate-api");
module.exports = {
  name: "translate",
  execute: async (sock, msg, args, from, sender) => {
    if (!args[0]) return await sock.sendMessage(from, { text: "🌐 Usage: !translate text | langCode" });
    const [text, lang] = args.join(" ").split("|").map(t => t.trim());
    const res = await translate(text, { to: lang || "en" });
    await sock.sendMessage(from, { text: `🌐 Translation: ${res.text}` });
  }
};
