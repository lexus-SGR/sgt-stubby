module.exports = {
  name: "whatishijab",
  description: "Answer: What is Hijab?",
  emoji: "🧕",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: "🧕", key: msg.key }
    });

    const message = `🧕 *What is Hijab?*\n
Hijab is a concept of modesty in Islam. It refers to both behavior and dress for men and women. For Muslim women, it includes covering the body except the face and hands.

Hijab is not just a scarf, but a reflection of modest conduct, humility, and devotion to Allah.

Wearing the hijab is a personal act of faith and identity. It is a sign of obedience and respect for Islamic teachings and values.`;

    await sock.sendMessage(msg.key.remoteJid, {
      text: message
    });
  }
};
