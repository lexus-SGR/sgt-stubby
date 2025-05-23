module.exports = {
  name: 'tagall',
  description: 'Mention all group members in a message',
  category: 'group',
  async execute(sock, m, args) {
    if (!m.isGroup) {
      return sock.sendMessage(m.chat, { text: '❌ This command only works in groups.' }, { quoted: m });
    }

    // AutoReact emoji
    await sock.sendMessage(m.chat, { react: { text: '📢', key: m.key } });

    const groupMetadata = await sock.groupMetadata(m.chat);
    const participants = groupMetadata.participants.map(p => p.id);

    let text = '*📣 Group Members:*\n\n';
    participants.forEach(p => {
      text += `@${p.split('@')[0]}\n`;
    });

    await sock.sendMessage(m.chat, {
      text: text,
      mentions: participants
    }, { quoted: m });
  }
};
