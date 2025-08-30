const handleModeration = require("../utils/moderationHelper");

module.exports = {
  name: "antibot",
  execute: async (sock, msg, args, from, sender, isGroup, featureFlags) => {
    if (!isGroup || !featureFlags.antibot?.enabled) return;
    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    if (!mentions.includes(botJid)) return;

    const number = sender.split("@")[0];
    await handleModeration(sock, msg, from, sender, number, featureFlags);
  }
};
