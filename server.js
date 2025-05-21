import express from 'express'
import * as baileys from '@whiskeysockets/baileys'
import Pino from 'pino'
import qrcode from 'qrcode'

const app = express()
const port = process.env.PORT || 3000

let qrCodeData = ''
let isConnected = false
let sock = null

async function startSock() {
  const { state, saveCreds } = await baileys.useMultiFileAuthState('auth_info')
  const { version } = await baileys.fetchLatestBaileysVersion()

  sock = baileys.makeWASocket({
    version,
    printQRInTerminal: false,
    auth: state,
    logger: Pino({ level: 'silent' })
  })

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      qrCodeData = await qrcode.toDataURL(qr)
      console.log('Tafadhali tembelea /pair kuona QR code')
      isConnected = false
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== baileys.DisconnectReason.loggedOut
      console.log('Connection imekatika:', lastDisconnect?.error, ', kujaribu kuungana tena:', shouldReconnect)
      isConnected = false
      qrCodeData = ''
      if (shouldReconnect) startSock()
    } else if (connection === 'open') {
      console.log('Bot imeungana kwa mafanikio.')
      isConnected = true
      qrCodeData = ''
    }
  })

  sock.ev.on('creds.update', saveCreds)

  // Mfano wa message listener: jibu ping kwa pong
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

app.get('/', (req, res) => {
  res.send(`<h2>Ben Whittaker Tech QR Site</h2><p>Tafadhali tembelea <a href="/pair">/pair</a> kuona QR Code ya ku-scan.</p>`)
})

app.get('/pair', (req, res) => {
  if (qrCodeData) {
    res.send(`<h2>Scan QR Code hapa chini</h2><img src="${qrCodeData}" /><p>Ben Whittaker Tech WhatsApp Bot</p>`)
  } else {
    res.send('QR haijapatikana bado. Tafadhali refresh ukurasa baada ya sekunde chache.')
  }
})

app.get('/status', (req, res) => {
  if (isConnected) {
    res.send('<h2>Status: Bot iko connected sasa.</h2>')
  } else {
    res.send('<h2>Status: Bot haipo au haijaunda connection bado.</h2>')
  }
})

app.listen(port, () => {
  console.log(`Server inasikiliza kwenye port ${port}`)
})
