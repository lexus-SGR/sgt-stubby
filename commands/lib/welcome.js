// commands/lib/welcome.js
export const name = 'welcome';

export async function execute(sock, m, args) {
  await sock.sendMessage(m.key.remoteJid, {
    text: '🎉 Welcome to the group!'
  }, { quoted: m });

  if (process.env.AUTO_REACT === 'on') {
    await sock.sendMessage(m.key.remoteJid, { react: { text: '🎉', key: m.key } });
  }
}
