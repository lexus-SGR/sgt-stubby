import express from 'express'
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys'
import Pino from 'pino'
import qrcode from 'qrcode'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.static('public'))

let qrCodeData = ''
let isConnected = false
let sock = null

const pairCodes = new Map() // phone => { code, timestamp }

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('session')
  const { version } = await fetchLatestBaileysVersion()

  sock = makeWASocket({
    version,
    auth: state,
    logger: Pino({ level: 'silent' })
  })

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      qrCodeData = await qrcode.toDataURL(qr)
      console.log('QR code updated! Visit /api/qr to scan.')
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

    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
    if (body.toLowerCase() === '!ping') {
      await sock.sendMessage(msg.key.remoteJid, { text: 'pong' }, { quoted: msg })
    }
  })
}

startSock()

// QR CODE API
app.get('/api/qr', (req, res) => {
  if (qrCodeData) {
    res.json({ qr: qrCodeData })
  } else {
    res.json({ qr: null })
  }
})

// GENERATE 8-DIGIT CODE
app.post('/api/generate-code', (req, res) => {
  const { number } = req.body
  if (!number || !number.match(/^\+?\d+$/)) {
    return res.status(400).json({ success: false, error: 'Number is invalid.' })
  }

  const code = Math.floor(10000000 + Math.random() * 90000000).toString()
  pairCodes.set(number, { code, timestamp: Date.now() })

  if (isConnected) {
    sock.sendMessage(`${number}@s.whatsapp.net`, { text: `Your pair code is: ${code}` }).catch(console.error)
  }

  res.json({ success: true, pairCode: code })
})

// VERIFY CODE
app.post('/api/verify-code', async (req, res) => {
  const { number, pairCode } = req.body
  const record = pairCodes.get(number)
  if (!record) return res.status(400).json({ success: false, error: 'Code not found.' })
  if (record.code !== pairCode) return res.status(400).json({ success: false, error: 'Invalid code.' })

  if (Date.now() - record.timestamp > 10 * 60 * 1000) {
    pairCodes.delete(number)
    return res.status(400).json({ success: false, error: 'Code expired.' })
  }

  if (!isConnected) return res.status(400).json({ success: false, error: 'Bot not connected.' })

  try {
    await sock.sendMessage(`${number}@s.whatsapp.net`, { text: `Session active for ${number}.` })
    res.json({ success: true, message: 'Session confirmed.' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to send message.' })
  }
})

// BOT STATUS
app.get('/status', (req, res) => {
  if (isConnected) {
    res.send('<h3>Bot is connected.</h3>')
  } else {
    res.send('<h3>Bot is NOT connected.</h3>')
  }
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
