const fs = require("fs");
const moment = require("moment-timezone");
require("dotenv").config();

module.exports = {
  name: "menu",
  description: "Show all bot commands in styled format",
  category: "general",
  execute: async (sock, m, args) => {
    const jid = m.key.remoteJid;
    const time = moment().tz("Africa/Nairobi").format("HH:mm:ss");
    const date = moment().tz("Africa/Nairobi").format("dddd, MMMM Do YYYY");
    const owner = process.env.OWNER_NAME || "SGT-STUBBY";

    const menuText = `
╭─〔 *🤖 SGT-STUBBY WHATSAPP BOT* 〕─╮
│ 🗓️ Date: ${date}
│ 🕒 Time: ${time}
│ 👑 Owner: ${owner}
╰────────────────────────╯

╭─〔 *📌 GENERAL* 〕─╮
│ !menu
│ !help
│ !ping
│ !uptime
│ !speed
│ !owner
│ !info
│ !script
╰────────────────────╯

╭─〔 *🧠 AI & INFO* 〕─╮
│ !ai [msg]
│ !chatgpt [prompt]
│ !img [prompt]
│ !weather [city]
│ !news
│ !quote
│ !wiki [query]
│ !fact
╰────────────────────╯

╭─〔 *📷 STICKER & MEDIA* 〕─╮
│ !sticker
│ !toimg
│ !tomp4
│ !tomp3
│ !emoji [emoji]
│ !attp [text]
│ !ttp [text]
│ !take [sticker]
╰────────────────────────╯

╭─〔 *🎵 MUSIC & VIDEO* 〕─╮
│ !play [song]
│ !ytmp3 [url]
│ !ytmp4 [url]
│ !soundcloud [link]
│ !lyrics [song]
│ !video [query]
│ !spotify [track]
╰────────────────────╯

╭─〔 *🛠️ TOOLS & UTILS* 〕─╮
│ !calc [math]
│ !translate [text]
│ !shorten [url]
│ !qr [text]
│ !removebg
│ !screenshot [url]
│ !github [user]
│ !pastebin [text]
╰────────────────────╯

╭─〔 *🎉 FUN & GAMES* 〕─╮
│ !joke
│ !meme
│ !truth
│ !dare
│ !ship @tag1 @tag2
│ !rate [name]
│ !gayrate [name]
│ !8ball [question]
╰────────────────────╯

╭─〔 *👥 GROUP ADMIN* 〕─╮
│ !tagall
│ !kick @user
│ !add [num]
│ !promote @user
│ !demote @user
│ !grouplink
│ !mute
│ !unmute
│ !revoke
╰────────────────────╯

╭─〔 *🔒 OWNER ONLY* 〕─╮
│ !shutdown
│ !restart
│ !eval [code]
│ !broadcast [msg]
│ !ban [user]
│ !unban [user]
│ !setprefix [x]
│ !setppbot
╰────────────────────╯
🌟 lexus AI HUB    🌟

🔖 *Category:* General, AI, Media, Tools, Fun, Group, Owner
`;

    const imageBuffer = fs.readFileSync('./public/lexus AI HUB.png');

    await sock.sendMessage(jid, {
      image: imageBuffer,
      caption: menuText,
    });
  }
};
