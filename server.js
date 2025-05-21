import express from 'express'
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys'
import Pino from 'pino'
import qrcode from 'qrcode'
import sassMiddleware from 'node-sass-middleware'
import path from 'path'
import { fileURLToPath } from 'url'

// Convert ES Module __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

// Sass middleware – compile SCSS to CSS
app.use(
  sassMiddleware({
    src: path.join(__dirname, 'public', 'scss'),
    dest: path.join(__dirname, 'public'),
    debug: true,
    outputStyle: 'compressed',
    prefix: '/', // So /style.css works
  })
)

app.use(express.json())
app.use(express.static('public'))

// Map for pair codes
const pairCodes = new Map()

function generatePairCode() {
  return Math.floor(10000000 + Math.random() * 90000000).toString()
}

let qrCodeData = ''
let sock = null
let isConnected = false

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('session')
  const { version } = await fetchLatestBaileysVersion()

  sock = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: state,
    logger: Pino({ level: 'silent' }),
  })

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      qrCodeData = await qrcode.toDataURL(qr)
      console.log('QR ready - visit browser to scan')
      isConnected = false
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('Connection closed:', lastDisconnect?.error, ', reconnecting:', shouldReconnect)
      isConnected = false
      qrCodeData = ''
      if (shouldReconnect) startSock()
    } else if (connection === 'open') {
      console.log('Bot connected successfully.')
      isConnected = true
      qrCodeData = ''
    }
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text || ''

    if (pairCodes.has(messageText)) {
      const pairInfo = pairCodes.get(messageText)
      pairInfo.connected = true
      pairInfo.jid = msg.key.remoteJid
      pairInfo.sessionId = Math.random().toString(36).slice(2, 10).toUpperCase()

      await sock.sendMessage(msg.key.remoteJid, {
        text: `Umeunganishwa na bot kwa pair code: ${messageText}\nSession ID yako ni: ${pairInfo.sessionId}\nHifadhi session hii kwa ajili ya deploy.`
      }, { quoted: msg })

      console.log(`User ${msg.key.remoteJid} connected with code ${messageText}, session ID: ${pairInfo.sessionId}`)
      return
    }

    if (messageText.toLowerCase() === '!pair') {
      const newCode = generatePairCode()
      pairCodes.set(newCode, { connected: false, jid: null, sessionId: null })
      await sock.sendMessage(msg.key.remoteJid, { text: `Pair code yako ni: ${newCode}\nTuma code hii kwenye app ili ku-link.` }, { quoted: msg })
      console.log(`Generated new pair code ${newCode} for ${msg.key.remoteJid}`)
      return
    }

    if (messageText.toLowerCase() === '!ping') {
      await sock.sendMessage(msg.key.remoteJid, { text: 'pong' }, { quoted: msg })
      return
    }
  })
}

startSock()

app.get('/api/qr', (req, res) => {
  res.json({ qr: qrCodeData || null })
})

app.get('/api/pair-code', (req, res) => {
  const code = generatePairCode()
  pairCodes.set(code, { connected: false, jid: null, sessionId: null })
  res.json({ pairCode: code })
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
