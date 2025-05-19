// commands/lib/delete.js
export const name = 'delete';

export async function execute(sock, m, args) {
  if (!m.message?.extendedTextMessage?.contextInfo?.stanzaId) return;
  const msgKey = {
    remoteJid: m.key.remoteJid,
    fromMe: false,
    id: m.message.extendedTextMessage.contextInfo.stanzaId,
    participant: m.message.extendedTextMessage.contextInfo.participant,
  };

  await sock.sendMessage(m.key.remoteJid, { delete: msgKey });

  if (process.env.AUTO_REACT === 'on') {
    await sock.sendMessage(m.key.remoteJid, { react: { text: '❌', key: m.key } });
  }
}
