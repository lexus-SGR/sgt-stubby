import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import Pino from 'pino'
import qrcode from 'qrcode'
import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// Bot kuu itakayotuma sessions kwa users
let mainSock = null
async function startMainSock() {
  const { state, saveCreds } = await useMultiFileAuthState('main_auth')
  const { version } = await fetchLatestBaileysVersion()
  mainSock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    logger: Pino({ level: 'silent' }),
  })
  mainSock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if(connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      console.log('Main sock disconnected:', statusCode)
      if(statusCode !== DisconnectReason.loggedOut) {
        startMainSock()
      }
    }
    if(connection === 'open') {
      console.log('Main sock connected')
    }
  })
  mainSock.ev.on('creds.update', saveCreds)
}
startMainSock()

// Map ya ku-track pair requests: number => sock instance
const pairings = new Map()

app.post('/generate-pair', async (req, res) => {
  try {
    const { number } = req.body
    if (!number || !number.startsWith('255')) {
      return res.status(400).json({ error: 'Tumia format sahihi ya namba: 2557XXXXXXX' })
    }
    if(pairings.has(number)) {
      return res.status(400).json({ error: 'Ombi tayari limeanza, subiri.' })
    }

    const folder = path.join(__dirname, 'auth_sessions', number)
    await fs.mkdir(folder, { recursive: true })

    const { state, saveCreds } = await useMultiFileAuthState(folder)
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: Pino({ level: 'silent' }),
      browser: ['BenWhittakerBot', 'Chrome', '1.0']
    })

    // Tumia event listener
    sock.ev.on('connection.update', async (update) => {
      const { connection, pairingCode, lastDisconnect } = update
      if (pairingCode) {
        pairings.set(number, sock)
        return res.json({ code: pairingCode })
      }
      if (connection === 'open') {
        await saveCreds()
        // Tuma creds.json kwa user kupitia mainSock
        const credsPath = path.join(folder, 'creds.json')
        const jid = `${number}@s.whatsapp.net`

        if (mainSock) {
          try {
            await mainSock.sendMessage(jid, {
              document: { url: credsPath },
              fileName: 'ben-whittaker-session.json',
              mimetype: 'application/json',
              caption: 'Session yako ya Ben Whittaker Bot imefika. Hifadhi kwa usalama.'
            })
            console.log(`✅ Session ya ${number} imetumwa kwa WhatsApp.`)
          } catch (e) {
            console.error('Kosa kutuma session:', e.message)
          }
        }

        pairings.delete(number)
        sock.end()
      }
      if(connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode
        if(statusCode === DisconnectReason.loggedOut) {
          await fs.rm(folder, { recursive: true, force: true })
        }
        pairings.delete(number)
      }
    })

    sock.ev.on('creds.update', saveCreds)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Tatizo limetokea' })
  }
})

app.listen(port, () => {
  console.log(`Server inasikiliza kwenye port ${port}`)
})
