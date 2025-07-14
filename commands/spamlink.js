module.exports = {
  name: "spamlink",
  description: "Send a valid link multiple times (you choose the amount).",
  emoji: "📤",
  async execute(sock, msg) {
    const jid = msg.key.remoteJid;
    const input = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

    // Hakikisha kuna input
    if (!input)
      return await sock.sendMessage(jid, {
        text: "📌 *Usage:* !spamlink <link> <amount>\n\nExample:\n!spamlink https://example.com 50"
      });

    // Gawa input kuwa sehemu mbili: link na number
    const [link, amountStr] = input.trim().split(/\s+/);

    // Check link validity
    const isValidLink = url => /^(https?:\/\/)?([\w\-]+\.)+[\w]{2,}(\/\S*)?$/.test(url);
    if (!isValidLink(link)) {
      return await sock.sendMessage(jid, {
        text: "❌ *Invalid link!*\nPlease use a real URL like: https://youtube.com"
      });
    }

    // Check amount validity
    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount < 1 || amount > 500) {
      return await sock.sendMessage(jid, {
        text: "🔢 *Invalid amount!*\nPlease enter a number between 1 and 500.\nExample: !spamlink https://link 100"
      });
    }

    // Delay helper
    const delay = ms => new Promise(res => setTimeout(res, ms));

    // Start spamming
    for (let i = 1; i <= amount; i++) {
      await sock.sendMessage(jid, {
        text: `🔗 *[${i}/${amount}]* ${link}`
      });
      await delay(250); // You can reduce or increase delay
    }

    await sock.sendMessage(jid, {
      text: `✅ Done! Sent ${amount} links.\n🔗 ${link}\n🚀 Powered by Ben Whittaker Tech™`
    });
  }
};
