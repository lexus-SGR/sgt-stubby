import express from 'express'
import { default as makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys'
import Pino from 'pino'
import qrcode from 'qrcode'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.static('public'))

let qrCodeData = ''
let isConnected = false
let sock = null

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
      console.log('Please visit /pair to scan the QR code')
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

    const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
    if (messageContent.toLowerCase() === '!ping') {
      await sock.sendMessage(msg.key.remoteJid, { text: 'pong' }, { quoted: msg })
    }
  })
}

startSock()

app.use('/pair', express.static('pair'))

app.get('/api/qr', (req, res) => {
  if (qrCodeData) {
    res.json({ qr: qrCodeData })
  } else {
    res.json({ qr: null })
  }
})

app.post('/api/send-session', async (req, res) => {
  const { number } = req.body
  if (!number || !number.match(/^\+?\d+$/)) {
    return res.status(400).json({ success: false, error: 'Invalid number. Please enter a valid WhatsApp number.' })
  }

  if (!isConnected) {
    return res.status(400).json({ success: false, error: 'Bot is not connected right now.' })
  }

  try {
    const message = 'Hello! Your bot is now connected. Session data is ready.'
    await sock.sendMessage(number + '@s.whatsapp.net', { text: message })

    return res.json({ success: true })
  } catch (error) {
    console.error('Error sending session:', error)
    return res.status(500).json({ success: false, error: 'Failed to send message via WhatsApp.' })
  }
})

app.get('/status', (req, res) => {
  if (isConnected) {
    res.send('<h2>Status: Bot is connected now.</h2>')
  } else {
    res.send('<h2>Status: Bot is not connected or has not established connection yet.</h2>')
  }
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
