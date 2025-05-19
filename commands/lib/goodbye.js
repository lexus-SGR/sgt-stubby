// commands/lib/goodbye.js
export const name = 'goodbye';

export async function execute(sock, m, args) {
  await sock.sendMessage(m.key.remoteJid, {
    text: '👋 Someone has left the group!'
  }, { quoted: m });

  if (process.env.AUTO_REACT === 'on') {
    await sock.sendMessage(m.key.remoteJid, { react: { text: '👋', key: m.key } });
  }
}
