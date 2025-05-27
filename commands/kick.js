module.exports = {
  name: "kick",
  description: "Remove a member from the group",
  category: "group",
  react: "🦶",
  usage: "kick @user",
  async execute(sock, msg, args, from, sender, groupMetadata) {
    if (!msg.key.remoteJid.endsWith("@g.us")) return;

    const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mention) {
      return sock.sendMessage(from, { text: "Please tag the user you want to kick." }, { quoted: msg });
    }

    await sock.groupParticipantsUpdate(from, [mention], "remove");
    await sock.sendMessage(from, { text: `User @${mention.split("@")[0]} has been kicked.`, mentions: [mention] }, { quoted: msg });
  }
}
