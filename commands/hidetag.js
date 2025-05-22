module.exports = {
  name: "hidetag",
  description: "Tag all group members secretly",
  category: "group",

  async execute(sock, msg, args, from, sender, groupMetadata, isGroupAdmin, isBotAdmin) {
    try {
      if (!groupMetadata || !groupMetadata.participants) {
        return await sock.sendMessage(from, { text: "⛔ This command only works in groups!" });
      }

      const ownerJid = "255760317060@s.whatsapp.net"; // badilisha na namba yako

      if (!isGroupAdmin && sender !== ownerJid) {
        return await sock.sendMessage(from, { text: "⚠️ Only group admins can use this command!" });
      }

      const message = args.join(" ") || "👀";
      const mentions = groupMetadata.participants.map(p => p.id);

      await sock.sendMessage(from, {
        text: message,
        mentions
      });

      await sock.sendMessage(from, {
        react: {
          text: "🙈",
          key: msg.key,
        }
      });

    } catch (err) {
      console.error("Error in hidetag:", err);
      await sock.sendMessage(from, { text: "❌ Error sending hidden tag." });
    }
  }
};
