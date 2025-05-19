// commands/lib/ping.js
export const name = 'ping';

export async function execute(sock, m, args) {
  await sock.sendMessage(m.key.remoteJid, { text: '🏓 Pong!' }, { quoted: m });

  if (process.env.AUTO_REACT === 'on') {
    await sock.sendMessage(m.key.remoteJid, { react: { text: '🏓', key: m.key } });
  }
}
