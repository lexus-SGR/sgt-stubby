module.exports = {
  name: "dua",
  description: "Send a beautiful daily dua.",
  emoji: "🤲",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "🤲 *Dua of the day*\n\nاللَّهُمَّ أَجِرْنِي مِنَ النَّارِ\n\n*O Allah, save me from the Hellfire*"
    });
  }
};
