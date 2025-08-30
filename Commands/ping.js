// commands/ping.js
module.exports = {
  name: "ping",
  execute: async (sock, msg, args, from, sender) => {
    // React emoji 🎯
    await sock.sendMessage(from, { react: { text: "🎯", key: msg.key } });

    const start = Date.now();
    await sock.sendMessage(from, { text: "🏓 Pinging..." });
    const latency = Date.now() - start;

    // Send ping result
    await sock.sendMessage(from, { 
      text: `🏓 Pong!\nLatency: ${latency}ms\n🤖 Powered by Uknown-corps Tech` 
    });
  }
};
