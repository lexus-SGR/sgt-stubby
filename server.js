import express from 'express'
import { makeWASocket, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import pino from 'pino'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors())

const pairCodes = new Map()

function generatePairCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

app.post('/api/pair-code', (req, res) => {
  const { phone } = req.body
  if (!phone) return res.status(400).json({ error: 'Please provide a phone number' })

  for (const [code, info] of pairCodes.entries()) {
    if (info.phone === phone) {
      return res.json({ pairCode: code })
    }
  }

  const code = generatePairCode()
  pairCodes.set(code, { phone, connected: false, jid: null, sessionId: null })

  return res.json({ pairCode: code })
})

let sock
async function startSock() {
  const { version } = await fetchLatestBaileysVersion()
  const logger = pino({ level: 'silent' })

  sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: true
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const status = lastDisconnect?.error?.output?.statusCode
      if (status !== DisconnectReason.loggedOut) {
        startSock()
      } else {
        console.log('Logged out from WhatsApp.')
      }
    }
    if (connection === 'open') {
      console.log('WhatsApp connection opened.')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''

    if (pairCodes.has(text)) {
      const info = pairCodes.get(text)
      if (info.connected) {
        await sock.sendMessage(msg.key.remoteJid, { text: `Pair code ${text} has already been used. Session ID: ${info.sessionId}` }, { quoted: msg })
        return
      }
      info.connected = true
      info.jid = msg.key.remoteJid
      info.sessionId = Math.random().toString(36).slice(2, 10).toUpperCase()

      await sock.sendMessage(msg.key.remoteJid, {
        text: `You are now connected to the bot!\nPair Code: ${text}\nSession ID: ${info.sessionId}\nPhone Number: ${info.phone}`
      }, { quoted: msg })

      console.log(`User ${msg.key.remoteJid} connected with code ${text}, session ${info.sessionId}, phone ${info.phone}`)
      return
    }

    await sock.sendMessage(msg.key.remoteJid, { text: 'Invalid pair code. Please send a valid code.' }, { quoted: msg })
  })
}

startSock()

app.use(express.static('public'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
