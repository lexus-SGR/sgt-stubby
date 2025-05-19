// commands/lib/tagall.js
export const name = 'tagall';

export async function execute(sock, m, args) {
  const metadata = await sock.groupMetadata(m.key.remoteJid);
  const members = metadata.participants.map(p => `@${p.id.split('@')[0]}`);
  await sock.sendMessage(m.key.remoteJid, {
    text: `📢 *Everyone:*\n${members.join(' ')}`,
    mentions: metadata.participants.map(p => p.id)
  }, { quoted: m });

  if (process.env.AUTO_REACT === 'on') {
    await sock.sendMessage(m.key.remoteJid, { react: { text: '📢', key: m.key } });
  }
}
