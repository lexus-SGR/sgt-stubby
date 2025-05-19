// commands/lib/admins.js
export const name = 'admins';

export async function execute(sock, m, args) {
  const metadata = await sock.groupMetadata(m.key.remoteJid);
  const admins = metadata.participants.filter(p => p.admin).map(p => `@${p.id.split('@')[0]}`);
  const text = `🛡️ *Admins:*\n${admins.join('\n')}`;
  await sock.sendMessage(m.key.remoteJid, { text, mentions: admins }, { quoted: m });

  if (process.env.AUTO_REACT === 'on') {
    await sock.sendMessage(m.key.remoteJid, { react: { text: '🛡️', key: m.key } });
  }
}
