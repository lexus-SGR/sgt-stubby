const handleModeration = require("../utils/moderationHelper");

module.exports = {
  name: "antipornsticker",
  execute: async (sock, msg, args, from, sender, isGroup, featureFlags) => {
    if (!isGroup || !featureFlags.antipornsticker?.enabled) return;
    if (!msg.message?.stickerMessage) return;

    const number = sender.split("@")[0];
    await handleModeration(sock, msg, from, sender, number, featureFlags);
  }
};
