// commands/lib/setprefix.js
export const name = 'setprefix';

export async function execute(sock, m, args, config) {
  if (!args[0]) return sock.sendMessage(m.key.remoteJid, { text: '⚙️ Please provide a new prefix.' }, { quoted: m });
  config.prefix = args[0];
  await sock.sendMessage(m.key.remoteJid, { text: `✅ Prefix updated to *${args[0]}*` }, { quoted: m });

  if (process.env.AUTO_REACT === 'on') {
    await sock.sendMessage(m.key.remoteJid, { react: { text: '⚙️', key: m.key } });
  }
}
