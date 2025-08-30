const handleModeration = require("../utils/moderationHelper");

module.exports = {
  name: "antipornvideo",
  execute: async (sock, msg, args, from, sender, isGroup, featureFlags) => {
    if (!isGroup || !featureFlags.antipornvideo?.enabled) return;
    if (!msg.message?.videoMessage) return;

    const number = sender.split("@")[0];
    await handleModeration(sock, msg, from, sender, number, featureFlags);
  }
};
