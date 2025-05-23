module.exports = {
  name: "salah",
  description: "Remind users to pray.",
  emoji: "🕋",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, { text: "🕋 _Don't forget your Salah!_\n\n*“Verily, Salah restrains from shameful and unjust deeds.” (Quran 29:45)*" });
  }
};
