const handleModeration = require("../utils/moderationHelper");

module.exports = {
  name: "antimention",
  execute: async (sock, msg, args, from, sender, isGroup, featureFlags) => {
    if (!isGroup || !featureFlags.antimention?.enabled) return;
    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    if (!body.includes("@")) return;

    const number = sender.split("@")[0];
    await handleModeration(sock, msg, from, sender, number, featureFlags);
  }
};
