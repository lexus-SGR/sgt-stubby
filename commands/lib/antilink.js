// commands/lib/antilink.js export const name = 'antilink';

export async function execute(sock, m, args) { const isGroup = m.key.remoteJid.endsWith('@g.us'); if (!isGroup) return;

const metadata = await sock.groupMetadata(m.key.remoteJid); const sender = m.key.participant || m.key.remoteJid; const isAdmin = metadata.participants.find(p => p.id === sender)?.admin;

const msgText = m.message?.conversation || m.message?.extendedTextMessage?.text || ''; const groupInviteRegex = /https://chat.whatsapp.com/[A-Za-z0-9]{20,}/gi; const foundLinks = msgText.match(groupInviteRegex);

if (foundLinks) { if (!isAdmin) { await sock.sendMessage(m.key.remoteJid, { text: 🚫 Sending group links is not allowed here. Since I'm not an admin, I can't remove you. But if an admin sees this, you may be removed., mentions: [sender], }, { quoted: m }); } else { await sock.sendMessage(m.key.remoteJid, { text: 🚫 @${sender.split('@')[0]} shared a group link and has been removed!, mentions: [sender], }); await sock.groupParticipantsUpdate(m.key.remoteJid, [sender], 'remove'); } }

// Auto reaction emoji if (process.env.AUTO_REACT === 'on') { await sock.sendMessage(m.key.remoteJid, { react: { text: '🔗', key: m.key } }); } }

