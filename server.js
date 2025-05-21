import express from 'express'
import { default as makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys'
import Pino from 'pino'
import qrcode from 'qrcode'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.static('public'))

let pairCodes = {}
let qrCodeData = ''
let isConnected = false
let sock = null

function generateCode() {
  return Math.floor(10000000 + Math.random() * 90000000).toString()
}

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
      isConnected = false
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
      isConnected = false
      qrCodeData = ''
      if (shouldReconnect) startSock()
    } else if (connection === 'open') {
      isConnected = true
      qrCodeData = ''
    }
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const number = msg.key.remoteJid.replace('@s.whatsapp.net', '')
    const message = msg.message.conversation || msg.message.extendedTextMessage?.text || ''

    if (/^\d{8}$/.test(message.trim())) {
      const code = message.trim()
      if (pairCodes[code] && pairCodes[code].number === number) {
        const zip = 'session.zip'
        const archiver = await import('archiver')
        const archive = archiver.default('zip', { zlib: { level: 9 } })
        const output = fs.createWriteStream(zip)

        archive.pipe(output)
        archive.directory('session/', false)
        archive.finalize()

        output.on('close', async () => {
          await sock.sendMessage(msg.key.remoteJid, {
            document: fs.readFileSync(zip),
            fileName: 'session.zip',
            mimetype: 'application/zip',
            caption: 'Umefanikiwa kuunganishwa! Hii hapa session yako kwa ajili ya ku-deploy bot.',
          })
          fs.unlinkSync(zip)
          delete pairCodes[code]
        })
      }
    }
  })
}

startSock()

app.post('/api/request-session', async (req, res) => {
  const { number } = req.body
  if (!number || !number.match(/^\+?\d+$/)) {
    return res.status(400).json({ error: 'Weka namba ya WhatsApp sahihi.' })
  }

  const code = generateCode()
  pairCodes[code] = { number: number.replace('+', ''), createdAt: Date.now() }

  try {
    await sock.sendMessage(number.replace('+', '') + '@s.whatsapp.net', {
      text: `Hello! Ingiza pair code hii: *${code}* kwenye ukurasa wa QR. Kisha scan QR yako.`
    })
    return res.json({ success: true, code })
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Imeshindikana kutuma ujumbe kwa WhatsApp.' })
  }
})

app.get('/api/qr', (req, res) => {
  res.json({ qr: qrCodeData || null })
})

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`)
})
