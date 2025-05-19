// commands/lib/quote.js
export const name = 'quote';

export async function execute(sock, m, args) {
  const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted) return sock.sendMessage(m.key.remoteJid, { text: '⚠️ No quoted message found.' }, { quoted: m });

  const text = quoted?.conversation || quoted?.extendedTextMessage?.text || '🗨️ [non-text message]';
  await sock.sendMessage(m.key.remoteJid, { text }, { quoted: m });

  if (process.env.AUTO_REACT === 'on') {
    await sock.sendMessage(m.key.remoteJid, { react: { text: '🗨️', key: m.key } });
  }
}
