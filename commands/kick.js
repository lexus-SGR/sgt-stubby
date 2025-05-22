module.exports = {
  name: "kick",
  description: "Remove a user from the group.",
  emoji: "🥾",

  async execute(sock, msg, args, isAdmin, isBotAdmin, groupMetadata) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const ownerJid = "255760317060@s.whatsapp.net"; // badilisha na yako kama si sahihi

    if (!from.endsWith("@g.us")) return;

    if (!isAdmin && sender !== ownerJid) {
      return sock.sendMessage(from, { text: "⛔ You must be a group admin to use this command." });
    }

    if (!isBotAdmin) {
      return sock.sendMessage(from, { text: "⚠️ I need admin rights to kick members." });
    }

    // Target user: mention or reply
    let targetJid = null;

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mentioned && mentioned.length > 0) {
      targetJid = mentioned[0];
    }

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!targetJid && quoted) {
      targetJid = quoted;
    }

    if (!targetJid) {
      return sock.sendMessage(from, { text: "⚠️ Tag or reply to the user you want to kick." });
    }

    const participantIds = groupMetadata.participants.map(p => p.id);
    if (!participantIds.includes(targetJid)) {
      return sock.sendMessage(from, { text: "❌ The user is not in this group." });
    }

    try {
      await sock.groupParticipantsUpdate(from, [targetJid], "remove");
      await sock.sendMessage(from, {
        text: `✅ Kicked: @${targetJid.split("@")[0]}`,
        mentions: [targetJid],
      });
    } catch (err) {
      console.error("Kick error:", err);
      await sock.sendMessage(from, { text: "❌ Failed to kick the user." });
    }
  }
};
