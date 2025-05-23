module.exports = {
  name: 'hidetag',
  description: 'Send a hidden message mentioning all group members',
  category: 'group',
  async execute(sock, m, args) {
    if (!m.isGroup) {
      return sock.sendMessage(m.chat, { text: '❌ This command only works in groups.' }, { quoted: m });
    }

    const message = args.join(' ');
    if (!message) {
      return sock.sendMessage(m.chat, { text: '✍️ Please provide a message to send.' }, { quoted: m });
    }

    // AutoReact emoji
    await sock.sendMessage(m.chat, { react: { text: '👻', key: m.key } });

    const groupMetadata = await sock.groupMetadata(m.chat);
    const participants = groupMetadata.participants.map(p => p.id);

    await sock.sendMessage(m.chat, {
      text: message,
      mentions: participants
    }, { quoted: m });
  }
};
