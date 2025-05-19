 
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  getAggregateVotesInPollMessage,
  proto,
  jidDecode,
} from '@whiskeysockets/baileys';

import pino from 'pino';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Boom } from '@hapi/boom';

dotenv.config();

const useLogger = pino({ level: 'silent' });
const msgRetryCounterCache = {};

const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    logger: useLogger,
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, useLogger),
    },
    msgRetryCounterCache,
    generateHighQualityLinkPreview: true,
  });

  sock.ev.on('creds.update', saveCreds);

  // Fake typing & recording
  if (process.env.FAKE_TYPING === 'on') {
    sock.ev.on('messages.upsert', async ({ messages }) => {
      const m = messages[0];
      if (!m.message) return;
      await sock.sendPresenceUpdate('composing', m.key.remoteJid);
      setTimeout(() => sock.sendPresenceUpdate('paused', m.key.remoteJid), 2000);
    });
  }
  if (process.env.FAKE_RECORDING === 'on') {
    sock.ev.on('messages.upsert', async ({ messages }) => {
      const m = messages[0];
      if (!m.message) return;
      await sock.sendPresenceUpdate('recording', m.key.remoteJid);
      setTimeout(() => sock.sendPresenceUpdate('paused', m.key.remoteJid), 2000);
    });
  }

  // Auto open view once
  if (process.env.AUTO_VIEW_ONCE === 'on') {
    sock.ev.on('messages.upsert', async ({ messages }) => {
      const m = messages[0];
      if (m.message?.viewOnceMessageV2) {
        let msg = m.message.viewOnceMessageV2.message;
        m.message = msg;
        await sock.sendMessage(m.key.remoteJid, { forward: m }, { quoted: m });
      }
    });
  }

  // Anti-delete
  if (process.env.ANTIDELETE === 'on') {
    sock.ev.on('messages.update', async (updates) => {
      for (const update of updates) {
        if (update.update?.messageStubType === 0) continue;
        if (update.messageStubType === 1 && update.key?.remoteJid?.endsWith('@g.us')) {
          const original = update.message;
          if (original) {
            await sock.sendMessage(update.key.remoteJid, {
              text: `Message deleted:

${JSON.stringify(original, null, 2)}`,
            });
          }
        }
      }
    });
  }

  // Load all commands from /commands/lib
  const commandsPath = path.join(__dirname, 'commands', 'lib');
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
  const commands = {};
  for (const file of commandFiles) {
    const command = await import(path.join(commandsPath, file));
    commands[command.name] = command.execute;
  }

  // Message handler
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;
    const body =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption || '';

    const prefix = '!';
    if (!body.startsWith(prefix)) return;
    const args = body.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (commands[command]) {
      try {
        await commands[command](sock, m, args);
      } catch (err) {
        await sock.sendMessage(m.key.remoteJid, { text: 'Error executing command.' }, { quoted: m });
      }
    }
  });

  // Group participant update (left notification)
  sock.ev.on('group-participants.update', async (update) => {
    if (update.action === 'remove') {
      const num = update.participants[0];
      await sock.sendMessage(update.id, { text: `@${num.split('@')[0]} has left the group.`, mentions: [num] });
    }
  });

  return sock;
};

startSock();
