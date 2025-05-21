import express from 'express' import { default as makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys' import Pino from 'pino' import qrcode from 'qrcode' import fs from 'fs' import path from 'path' import { fileURLToPath } from 'url' import { randomUUID } from 'crypto'

const __filename = fileURLToPath(import.meta.url) const __dirname = path.dirname(__filename)

const app = express() const port = process.env.PORT || 3000 app.use(express.json()) app.use(express.static('public'))

let pairCodes = {} let activeSessions = {} let sock = null

async function startSock() { const { state, saveCreds } = await useMultiFileAuthState('session') const { version } = await fetchLatestBaileysVersion()

sock = makeWASocket({ version, printQRInTerminal: false, auth: state, logger: Pino({ level: 'silent' }) })

sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => { if (qr) { const imgPath = path.join(__dirname, 'public/qrscan.png') await qrcode.toFile(imgPath, qr) console.log('Scan QR at: /qrscan.png') }

if (connection === 'close') {
  const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
  if (shouldReconnect) startSock()
}

if (connection === 'open') {
  console.log('Connected')
}

})

sock.ev.on('creds.update', saveCreds)

sock.ev.on('messages.upsert', async ({ messages }) => { const msg = messages[0] if (!msg.message || msg.key.fromMe) return const jid = msg.key.remoteJid const messageContent = msg.message?.conversation || msg.message?.extendedTextMessage?.text || ''

if (messageContent.toLowerCase().startsWith('!pair')) {
  const code = Math.floor(10000000 + Math.random() * 90000000).toString()
  pairCodes[code] = jid
  await sock.sendMessage(jid, { text: `Code yako ni: ${code}. Ingiza kwenye tovuti ili upokee session.` })
}

}) }

app.post('/api/request-session', async (req, res) => { const { code } = req.body const jid = pairCodes[code] if (!jid) return res.status(400).json({ success: false, message: 'Code si sahihi au imeisha muda.' })

const sessionFile = path.join(__dirname, 'session/creds.json') if (!fs.existsSync(sessionFile)) return res.status(500).json({ success: false, message: 'Session haipo bado.' })

await sock.sendMessage(jid, { document: { url: sessionFile }, mimetype: 'application/json', fileName: 'your-session.json', caption: 'Umeunganishwa na bot. Session yako iko hapa, unaweza ku-deploy bot yako.' })

delete pairCodes[code] res.json({ success: true, message: 'Session imetumwa kupitia WhatsApp.' }) })

app.get('/status', (req, res) => { res.send('<h2>Status: Bot inafanya kazi.</h2><p>Support: +255760317060</p>') })

startSock()

app.listen(port, () => { console.log(Server is running on http://localhost:${port}) })

