module.exports = {
  name: "hidetag",
  description: "Tag all group members secretly",
  category: "group",

  async execute(sock, msg, args, from, sender, groupMetadata, isGroupAdmin, isBotAdmin) {
    try {
      if (!groupMetadata || !groupMetadata.participants) {
        return await sock.sendMessage(from, { text: "⛔ This command only works in groups!" });
      }

      const ownerJid = "255760317060@s.whatsapp.net"; // badilisha kwa namba yako halisi ya owner

      // Ruhusu owner tu au admin
      if (!isGroupAdmin && sender !== ownerJid) {
        return await sock.sendMessage(from, { text: "⚠️ Only *admins* or the *owner* can use this command!" });
      }

      // Bot lazima awe admin
      if (!isBotAdmin) {
        return await sock.sendMessage(from, { text: "🤖 Bot needs to be *admin* to tag everyone!" });
      }

      const message = args.join(" ") || "👀";
      const mentions = groupMetadata.participants.map(p => p.id);

      await sock.sendMessage(from, {
        text: message,
        mentions,
      }, { quoted: msg });

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
