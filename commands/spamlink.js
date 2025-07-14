module.exports = {
  name: "spamlink",
  description: "Send a custom link 100 times.",
  emoji: "📤",
  async execute(sock, msg) {
    const jid = msg.key.remoteJid;
    const input = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

    // Hakikisha user ameweka link
    if (!input || !input.startsWith("http")) {
      return await sock.sendMessage(jid, {
        text: "🔗 *Usage:* !spamlink https://your-link.com"
      });
    }

    const link = input.trim();
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 1; i <= 100; i++) {
      await sock.sendMessage(jid, {
        text: `🔗 *[${i}]* ${link}`
      });
      await delay(300); // 300ms delay kati ya kila link ili kuepuka block
    }

    await sock.sendMessage(jid, {
      text: `✅ Done! Sent your link 100 times.\n🔗 ${link}\n🚀 Powered by Ben Whittaker Tech™`
    });
  }
};
