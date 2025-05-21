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

// Hapa tunahifadhi pair codes na namba
const pairCodes = new Map() // key: phone, value: { code, timestamp }

// Function ya kuanzisha WhatsApp socket
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
      console.log('QR code updated, visit / to scan it')
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

// API ya kutoa QR code kama DataURL
app.get('/api/qr', (req, res) => {
  if (qrCodeData) {
    res.json({ qr: qrCodeData })
  } else {
    res.json({ qr: null })
  }
})

// API ya generate pair code (8 digits) kwa namba
app.post('/api/generate-code', (req, res) => {
  const { number } = req.body
  if (!number || !number.match(/^\+?\d+$/)) {
    return res.status(400).json({ success: false, error: 'Invalid number. Please enter a valid phone number with country code.' })
  }

  const code = Math.floor(10000000 + Math.random() * 90000000).toString() // 8-digit code
  pairCodes.set(number, { code, timestamp: Date.now() })

  // Tuma pair code kwa WhatsApp via bot kama inavyoweza, hapa tu print kama mock
  if (isConnected) {
    sock.sendMessage(number + '@s.whatsapp.net', { text: `Your pair code is: ${code}` }).catch(console.error)
  }

  res.json({ success: true, pairCode: code })
})

// API ya verify pair code na kisha tuma message ya session connection
app.post('/api/verify-code', async (req, res) => {
  const { number, pairCode } = req.body
  if (!number || !pairCode) {
    return res.status(400).json({ success: false, error: 'Number and pairCode are required.' })
  }

  const record = pairCodes.get(number)
  if (!record) {
    return res.status(400).json({ success: false, error: 'No pair code found for this number.' })
  }

  if (record.code !== pairCode) {
    return res.status(400).json({ success: false, error: 'Invalid pair code.' })
  }

  // Optionally, check expiration (e.g., 10 minutes)
  if (Date.now() - record.timestamp > 10 * 60 * 1000) {
    pairCodes.delete(number)
    return res.status(400).json({ success: false, error: 'Pair code expired.' })
  }

  if (!isConnected) {
    return res.status(400).json({ success: false, error: 'Bot is not connected right now.' })
  }

  try {
    await sock.sendMessage(number + '@s.whatsapp.net', {
      text: `Bot is connected and session is active for ${number}.`
    })

    // Hapa unaweza pia kupeleka data nyingine kama session details (siyo kuhifadhi file)
    res.json({ success: true, message: 'Session confirmed and message sent to WhatsApp.' })
  } catch (error) {
    console.error('Error sending session message:', error)
    res.status(500).json({ success: false, error: 'Failed to send session message via WhatsApp.' })
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
