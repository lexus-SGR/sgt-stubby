import { default as makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { readdirSync } from 'fs';
import path from 'path';

async function startBot() {
  // Pata auth state kwenye folder 'auth_info'
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if(connection === 'open') {
      console.log('✅ Bot imeunganishwa WhatsApp');
    } else if(connection === 'close') {
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('❌ Connection imekatika:', lastDisconnect.error);
      if(shouldReconnect) {
        startBot(); // Reconnect
      }
    }
  });

  // Pokea ujumbe
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if(type !== 'notify') return;

    const msg = messages[0];
    if(!msg.message || msg.key.fromMe) return;

    // Fanya text command parsing
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if(!text) return;

    // Check kama ni command
    if(!text.startsWith('!')) return;
    const commandName = text.slice(1).split(' ')[0].toLowerCase();

    // Load commands kutoka folder commands
    try {
      const commandsPath = path.resolve('./commands');
      const commandFiles = readdirSync(commandsPath).filter(f => f.endsWith('.js'));
      
      for(const file of commandFiles) {
        const command = await import(path.join(commandsPath, file));
        if(command.name === commandName) {
          await command.execute(sock, msg, text);
          break;
        }
      }
    } catch (err) {
      console.error('❌ Error loading commands:', err);
    }
  });
}

startBot();
