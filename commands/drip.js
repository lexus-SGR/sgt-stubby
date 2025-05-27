module.exports = {
  name: "drip",
  description: "Drip level test",
  execute: async (sock, msg, from) => {
    const drip = ["No drip", "Mild drip", "Average drip", "Certified Drip Master", "Drip overload"];
    const result = drip[Math.floor(Math.random() * drip.length)];
    await sock.sendMessage(from, { react: { text: '💧', key: msg.key }});
    await sock.sendMessage(from, { text: `Drip Check: ${result}` }, { quoted: msg });
  }
};
