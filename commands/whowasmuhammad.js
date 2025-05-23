module.exports = {
  name: "whowasmuhammad",
  description: "Answer: Who was Prophet Muhammad?",
  emoji: "🕊️",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "🕊️ *Who was Prophet Muhammad (SAW)?*\n\nProphet Muhammad (peace be upon him) was the final prophet sent by Allah to guide mankind. He was born in Mecca in 570 CE and received revelations that form the Quran. He is the perfect example for Muslims to follow."
    });
  }
};
