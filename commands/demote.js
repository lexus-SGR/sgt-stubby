module.exports = {
  name: "demote",
  description: "Remove admin privileges from a user.",
  emoji: "⬇️",

  async execute(sock, msg, args, isAdmin, isBotAdmin, groupMetadata) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const ownerJid = "255760317060@s.whatsapp.net";

    if (!from.endsWith("@g.us")) return;
    if (!isAdmin && sender !== ownerJid)
      return sock.sendMessage(from, { text: "⛔ Only admins can demote members." });
    if (!isBotAdmin)
      return sock.sendMessage(from, { text: "⚠️ I need admin rights to demote." });

    const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                   msg.message?.extendedTextMessage?.contextInfo?.participant;

    if (!target) return sock.sendMessage(from, { text: "⚠️ Tag or reply to user to demote." });

    try {
      await sock.groupParticipantsUpdate(from, [target], "demote");
      await sock.sendMessage(from, { text: `✅ Demoted @${target.split("@")[0]}`, mentions: [target] });
    } catch {
      await sock.sendMessage(from, { text: "❌ Failed to demote user." });
    }
  }
};
