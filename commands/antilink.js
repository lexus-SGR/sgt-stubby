module.exports = {
  name: "antilink",
  description: "Enable or disable anti-link in group.",
  emoji: "🔗",
  async execute(sock, msg, args, isAdmin, isBotAdmin, groupMetadata, db) {
    const groupId = msg.key.remoteJid;

    if (!groupId.endsWith("@g.us"))
      return await sock.sendMessage(groupId, { text: "This command only works in groups." });

    if (!isAdmin)
      return await sock.sendMessage(groupId, { text: "You must be an admin to toggle anti-link." });

    if (!isBotAdmin)
      return await sock.sendMessage(groupId, { text: "Bot needs admin rights to enforce anti-link." });

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status))
      return await sock.sendMessage(groupId, { text: "Usage: !antilink on/off" });

    db.antilink = db.antilink || {};
    db.antilink[groupId] = status === "on";

    await sock.sendMessage(groupId, {
      text: `Anti-link has been *${status.toUpperCase()}* for this group.`,
      react: { text: "🔗", key: msg.key }
    });
  }
};
