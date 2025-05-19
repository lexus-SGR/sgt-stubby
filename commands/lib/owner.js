// commands/lib/owner.js
export const name = 'owner';

export async function execute(sock, m, args) {
  const owner = process.env.OWNER_NUMBER;
  await sock.sendMessage(m.key.remoteJid, {
    text: `👑 Bot owner: wa.me/${owner}`
  }, { quoted: m });

  if (process.env.AUTO_REACT === 'on') {
    await sock.sendMessage(m.key.remoteJid, { react: { text: '👑', key: m.key } });
  }
}
