const menu = {
name: "menu",
description: "Onesha orodha ya amri zote za bot",
emoji: "📜",
async execute(sock, msg) {
const from = msg.key.remoteJid;
const commandList = `
╭━━━┳━━━┳━━━┳━╮╱╭┳━━━┳━━━┳━╮╭━╮
┃╭━╮┃╭━╮┃╭━╮┃┃╰╮┃┃╭━╮┃╭━╮┃┃╰╯┃┃
┃┃╱┃┃┃╱┃┃┃╱╰┫╭╮╰╯┃┃╱┃┃╰━━┫╭╮╭╮┃
┃╰━╯┃╰━╯┃┃╱╭┫┃╰╮┃┃┃╱┃┣━━╮┃┃┃┃┃┃
┃╭━╮┃╭━╮┃╰━╯┃┃╱┃┃┃╰━╯┃╰━╯┃┃┃┃┃┃
╰╯╱╰┻╯╱╰┻━━━┻╯╱╰━┻━━━┻━━━┻╯╰╯╰╯
Ben Whittaker Tech Bot
📱 WhatsApp Assistant
✨ 200+ Features | AI | Islamic | Fun

🧠 AI & Tools
├─ !ai [swali]
├─ !gpt4 [swali]
├─ !image [prompt]
├─ !draw [prompt]
├─ !code [maelezo]
├─ !translate [lugha]
├─ !brainstorm [topic]
├─ !summarize [text]
├─ !weather [jiji]
├─ !define [neno]
├─ !news
├─ !math [hesabu]
├─ !search [query]
├─ !chatpdf [reply pdf]
├─ !qr [text/url]

🔊 Media & Music
├─ !ytmp3 [url]
├─ !ytmp4 [url]
├─ !play [title]
├─ !video [title]
├─ !spotify [link]
├─ !deezer [link]
├─ !lyrics [title]
├─ !ringtone [name]
├─ !voice [text]
├─ !audiotrim [sec]
├─ !bass [reply audio]
├─ !slow [reply audio]
├─ !fast [reply audio]
├─ !vn [reply audio]
├─ !tomp3 [reply video]

🎭 Fun & Stickers
├─ !joke
├─ !meme
├─ !sticker
├─ !stickertext [text]
├─ !emojimix [emoji+emoji]
├─ !ascii [text]
├─ !truth
├─ !dare
├─ !quote
├─ !fact
├─ !ghosttext [text]
├─ !lovemeter
├─ !ship [@user1] [@user2]
├─ !rate [@user]
├─ !fakecall

⚽ Sports
├─ !livescore [league]
├─ !fixtures [team]
├─ !table [league]
├─ !topscorers [league]
├─ !match [team1 vs team2]

⚙️ Group & Admin
├─ !kick [@user]
├─ !promote [@user]
├─ !demote [@user]
├─ !antilink on/off
├─ !welcome on/off
├─ !autosticker on/off
├─ !group open/close
├─ !tagall
├─ !hidetag [msg]
├─ !setname [name]
├─ !setdesc [desc]
├─ !setppgroup
├─ !linkgroup
├─ !revoke
├─ !admins

🕌 Islamic Commands
├─ !quran [sura] [aya]
├─ !quranAudio [sura]
├─ !hadith
├─ !hadithAudio
├─ !dua
├─ !duaaudio
├─ !prayer [jiji]
├─ !azan [jiji]
├─ !99names
├─ !zikr
├─ !salahtimes [jiji]
├─ !surahlist
├─ !hijridate
├─ !randomayah
├─ !tafsir [sura:aya]

🛡️ Security
├─ !banword add/remove [word]
├─ !antifake on/off
├─ !antiviewonce on/off
├─ !antidelete on/off
├─ !antiimage on/off
├─ !antivideo on/off

👤 Owner & System
├─ !eval [code]
├─ !exec [cmd]
├─ !restart
├─ !shutdown
├─ !setpp
├─ !join [group link]
├─ !leave [group]
├─ !block [@user]
├─ !unblock [@user]
├─ !broadcast [msg]
├─ !bcimage [reply img]
├─ !feature on/off [name]
├─ !ban [@user]
├─ !unban [@user]
├─ !uptime
╰━━━━━━━━━━━━━━━━━━━━━━━╯
© 2025 Ben Whittaker Tech
╭━━━━━━━━━━━━━━━━━━━━━━━╮
┃   ⚙️ Prefix: !         📌
┃   ⚡ Over 200+ Features Active
┃   🧠 AI | 🎵 Music | 🎭 Fun | 🕌 Islamic
┃   🔒 Owner: wa.me/255760317060
╰━━━━━━━━━━━━━━━━━━━━━━━╯
📍 Powered by: Ben Whittaker Tech
🌐 www.benwhittaker.tech
`.trim();

await sock.sendMessage(from, { text: commandList });

}
};

module.exports = menu;......nataka unipe lengine zuri zIdi

