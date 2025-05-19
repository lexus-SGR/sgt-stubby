import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} from '@whiskeysockets/baileys';

import express from 'express';
import pino from 'pino';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const useLogger = pino({ level: 'silent' });
const msgRetryCounterCache = {};
const app = express();
const PORT = process.env.PORT || 3000;

let globalSock;

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
  globalSock = sock;

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

  if (process.env.ANTIDELETE === 'on') {
    sock.ev.on('messages.update', async (updates) => {
      for (const update of updates) {
        if (update.update?.messageStubType === 0) continue;
        if (update.messageStubType === 1 && update.key?.remoteJid?.endsWith('@g.us')) {
          const original = update.message;
          if (original) {
            await sock.sendMessage(update.key.remoteJid, {
              text: `Message deleted:\n\n${JSON.stringify(original, null, 2)}`,
            });
          }
        }
      }
    });
  }

  const commandsPath = path.join(__dirname, 'commands', 'lib');
  const commandFiles = fs.existsSync(commandsPath)
    ? fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'))
    : [];

  const commands = {};
  for (const file of commandFiles) {
    const command = await import(path.join(commandsPath, file));
    commands[command.name] = command.execute;
  }

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
      } catch {
        await sock.sendMessage(m.key.remoteJid, { text: 'Error executing command.' }, { quoted: m });
      }
      return;
    }

    if (command === 'getcode') {
      if (!sock.authState.creds.registered) {
        try {
          const code = await sock.requestPairingCode(m.key.remoteJid);
          await sock.sendMessage(m.key.remoteJid, {
            text: `🔐 *Pairing Code*\n\nUse this code to link your device:\n\n*${code}*\n\nGo to WhatsApp > Linked Devices > Link with code.`,
          });
        } catch {
          await sock.sendMessage(m.key.remoteJid, {
            text: 'Failed to generate pairing code.',
          });
        }
      } else {
        await sock.sendMessage(m.key.remoteJid, { text: '✅ Bot is already paired.' });
      }
    }
  });

  sock.ev.on('group-participants.update', async (update) => {
    if (update.action === 'remove') {
      const num = update.participants[0];
      await sock.sendMessage(update.id, {
        text: `@${num.split('@')[0]} has left the group.`,
        mentions: [num],
      });
    }
  });

  return sock;
};

startSock();

app.get('/paircode', async (req, res) => {
  try {
    if (globalSock && !globalSock.authState.creds.registered) {
      const code = await globalSock.requestPairingCode("user@example.com");
      res.send(`
        <html>
          <head><title>Pairing Code</title></head>
          <body style="font-family:sans-serif; text-align:center; padding:50px;">
            <h2>🔐 Pairing Code</h2>
            <h1>${code}</h1>
            <p>Go to WhatsApp > Linked Devices > Link with code</p>
          </body>
        </html>
      `);
    } else {
      res.send('<h2>✅ Bot is already paired.</h2>');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('<h2>❌ Error generating pairing code.</h2>');
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Server running: http://localhost:${PORT}/paircode`);
});
