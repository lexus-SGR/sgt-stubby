// Example: Use a Map to store welcome messages per group

let welcomeMessages = new Map();

module.exports = {
  name: "setwelcome",
  description: "Set the welcome message for the group. (Admin only)",
  emoji: "✍️",
  async execute(sock, msg, args) {
    if (!msg.key.remoteJid.endsWith("@g.us")) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Only groups." });

    const isAdmin = (await sock.groupMetadata(msg.key.remoteJid)).participants.find(p => p.id === msg.key.participant).admin;
    if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Only admins can set welcome message." });

    const text = args.join(" ");
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Please provide the welcome message." });

    welcomeMessages.set(msg.key.remoteJid, text);
    await sock.sendMessage(msg.key.remoteJid, { text: `✅ Welcome message set:\n${text}` });
  }
};
