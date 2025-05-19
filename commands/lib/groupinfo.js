// commands/lib/groupinfo.js
export const name = 'groupinfo';

export async function execute(sock, m, args) {
  const metadata = await sock.groupMetadata(m.key.remoteJid);
  const text = `👥 *Group Name:* ${metadata.subject}\n👤 *Participants:* ${metadata.participants.length}\n🆔 *ID:* ${m.key.remoteJid}`;
  await sock.sendMessage(m.key.remoteJid, { text }, { quoted: m });

  if (process.env.AUTO_REACT === 'on') {
    await sock.sendMessage(m.key.remoteJid, { react: { text: '👥', key: m.key } });
  }
}
