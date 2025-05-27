module.exports = {
  name: "goodbye",
  description: "Say goodbye to someone in the group",
  category: "group",
  react: "👋", // Auto react emoji
  usage: "goodbye @user",
  async execute(sock, msg, args, from, sender, groupMetadata) {
    if (!msg.key.participant && !msg.key.remoteJid.endsWith("@g.us")) {
      return sock.sendMessage(from, { text: "❌ This command only works in groups." }, { quoted: msg });
    }

    if (!msg.message.extendedTextMessage || !msg.message.extendedTextMessage.contextInfo.mentionedJid) {
      return sock.sendMessage(from, { text: "Please mention a user to say goodbye to.\n\n*Example:* goodbye @user" }, { quoted: msg });
    }

    const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
    const name = groupMetadata?.subject || "this group";
    const profile = await sock.profilePictureUrl(mentioned, "image").catch(() => null);

    const goodbyeMsg = `👋 *Goodbye* @${mentioned.split("@")[0]}\n\nWe’re sad to see you leave *${name}*.\nWishing you all the best ahead!`;

    await sock.sendMessage(from, {
      text: goodbyeMsg,
      mentions: [mentioned],
      ...(profile ? {
        image: { url: profile },
        caption: goodbyeMsg
      } : {})
    }, { quoted: msg });
  }
};
