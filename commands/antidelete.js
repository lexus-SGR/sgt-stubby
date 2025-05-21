module.exports = {
  name: "antidelete",
  description: "Repost deleted messages.",
  emoji: "♻️",
  async execute(sock, msg, args, isOwner, db) {
    if (!isOwner) return sock.sendMessage(msg.key.remoteJid, { text: "Owner only command." });

    const status = args[0];
    if (status !== "on" && status !== "off") return sock.sendMessage(msg.key.remoteJid, { text: "Use: !antidelete on/off" });

    db.antidelete = status === "on";
    await sock.sendMessage(msg.key.remoteJid, { text: `Anti-delete is now *${status}*`, react: { text: "♻️", key: msg.key } });
  }
};
