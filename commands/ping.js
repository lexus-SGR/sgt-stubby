module.exports = {
  name: "ping",
  description: "Checks if the bot is alive and active.",
  emoji: "🏓",
  async execute(sock, msg) {
    const jid = msg.key.remoteJid;

    // Step 1: React with ping emoji
    await sock.sendMessage(jid, {
      react: {
        text: "🏓",
        key: msg.key
      }
    });

    // Step 2: Beautiful and branded response
    const response = `
╔══════════════════════════╗
   🌐 𝘽𝙀𝙉 𝙒𝙃𝙄𝙏𝙏𝘼𝙆𝙀𝙍 𝙏𝙀𝘾𝙃 𝘽𝙊𝙏 ™
╚══════════════════════════╝

👋 *Hello! I'm alive and ready to serve!*

┏━━━━━━━━━━━━━━━━━━━━━┓
┃ 🛠️ *Status:* Online & Stable
┃ 📶 *Command:* ping
┃ 💥 *Response:* Pong! 🏓
┃ 🕘 *Time:* ${new Date().toLocaleString('en-GB', { timeZone: 'Africa/Dar_es_Salaam' })}
┃ 🚀 *Brand:* Ben Whittaker Tech™
┗━━━━━━━━━━━━━━━━━━━━━┛

🔔 Type *!menu* to see full features
📞 Need help? Contact the owner directly
`.trim();

    await sock.sendMessage(jid, { text: response });
  }
};
