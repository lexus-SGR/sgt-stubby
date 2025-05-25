module.exports = async function handleAntiLink(sock, msg, ANTILINK_ACTION) {
  const messageContent = msg.message?.conversation ||
                         msg.message?.extendedTextMessage?.text ||
                         msg.message?.imageMessage?.caption || "";

  const linkRegex = /(https?:\/\/[^\s]+)/g;
  if (!linkRegex.test(messageContent)) return;

  const sender = msg.key.participant || msg.key.remoteJid;
  const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
  const isAdmin = groupMetadata.participants.some(p => p.id === sender && p.admin);
  const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
  const isBotAdmin = groupMetadata.participants.some(p => p.id === botId && p.admin);

  if (!isBotAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ I can't take action because I'm not an admin." });
    return;
  }

  if (isAdmin) return;

  if (ANTILINK_ACTION === "remove") {
    await sock.sendMessage(msg.key.remoteJid, { text: `🚫 ${sender.split("@")[0]} has been removed for sending a link!` });
    await sock.groupParticipantsUpdate(msg.key.remoteJid, [sender], "remove");
  } else if (ANTILINK_ACTION === "warn") {
    await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ ${sender.split("@")[0]}, please do not send links in this group.` });
  }
};
