module.exports = {
  name: "stupid",
  description: "Stupidity percentage",
  execute: async (sock, msg, from) => {
    const percent = Math.floor(Math.random() * 100) + 1;
    await sock.sendMessage(from, { react: { text: '🧠', key: msg.key }});
    await sock.sendMessage(from, { text: `IQ Analysis complete: You're ${percent}% stupid.` }, { quoted: msg });
  }
};
