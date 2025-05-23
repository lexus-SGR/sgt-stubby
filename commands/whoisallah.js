module.exports = {
  name: "whoisallah",
  description: "Answer: Who is Allah?",
  emoji: "🕋",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "🕋 *Who is Allah?*\n\nAllah is the One and Only God in Islam. He is the Creator of everything that exists. He has no partners, no children, and nothing is like Him. Allah is Merciful, Just, and All-Knowing."
    });
  }
};
