module.exports = {
  name: "whatisjannah",
  description: "Answer: What is Jannah?",
  emoji: "🌴",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "🌴 *What is Jannah (Paradise)?*\n\nJannah is the eternal Paradise promised to the believers in the Hereafter. It is a place of peace, joy, and no pain or sadness. The rewards in Jannah are beyond human imagination, prepared by Allah for the righteous."
    });
  }
};
