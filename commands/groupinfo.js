module.exports = {
  name: 'groupinfo',
  description: 'Displays information about the group',
  category: 'group',
  async execute(sock, msg, args) {
    const { from, isGroup } = msg;

    if (!isGroup) {
      await sock.sendMessage(from, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
      return;
    }

    const metadata = await sock.groupMetadata(from);
    const admins = metadata.participants.filter(p => p.admin !== null);
    const groupInfo = `
*📛 Group Name:* ${metadata.subject}
*🆔 Group ID:* ${from}
*👤 Participants:* ${metadata.participants.length}
*🛡️ Admins:* ${admins.length}
*👑 Group Owner:* @${metadata.owner?.split('@')[0] || 'Unknown'}
*📆 Created:* ${new Date(metadata.creation * 1000).toLocaleString()}
`;

    await sock.sendMessage(from, {
      text: groupInfo,
      mentions: [metadata.owner],
    }, { quoted: msg });

    await sock.sendMessage(from, { react: { text: '📊', key: msg.key } });
  }
};
