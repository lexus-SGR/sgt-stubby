const OWNER_JID = "255760317060@s.whatsapp.net";

module.exports = {
  name: "owner",
  description: "Shows bot owner's contact.",
  emoji: "👑",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: "👑", key: msg.key },
    });
    await sock.sendMessage(msg.key.remoteJid, {
      text: `👑 Bot Owner: @${OWNER_JID.split("@")[0]}`,
      mentions: [OWNER_JID],
    });
  },
};
