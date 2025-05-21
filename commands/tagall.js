module.exports = async (sock, msg, args, isGroupAdmin, participants, from, sender, OWNER_JID) => {
  if (!isGroupAdmin && sender !== OWNER_JID) {
    return await sock.sendMessage(from, { text: "⚠️ Admins only!" });
  }

  let text = "📢 *TAG ALL MEMBERS:*\n\n";
  participants.forEach((p, i) => {
    text += `${i + 1}. @${p.split("@")[0]}\n`;
  });

  await sock.sendMessage(from, {
    text,
    mentions: participants,
  });

  await sock.sendMessage(from, {
    react: { text: "📣", key: msg.key }
  });
};
