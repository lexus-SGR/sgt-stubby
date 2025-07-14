const fs = require("fs");
require("dotenv").config();

module.exports = {
  name: "menu",
  description: "Show all bot commands in styled format",
  category: "general",
  execute: async (sock, m) => {
    const jid = m.key.remoteJid;
    const now = new Date();

    const time = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Nairobi",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(now);

    const date = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Nairobi",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now);

    const owner = process.env.OWNER_NAME || "Ben Whittaker Tech";

    const menuText = `
╭─〔 🤖 *${owner.toUpperCase()} BOT MENU* 〕─╮
│ 🗓️ ${date}
│ 🕒 ${time}
│ 👑 Owner: ${owner}
╰──────────────────────────────╯

╭─〔 📌 *GENERAL (15)* 〕─╮
│ !menu   !help   !ping   !uptime
│ !speed  !owner  !info   !script
│ !time   !about  !support  !alive
│ !bug    !contact  !rules
╰────────────────────╯

╭─〔 🧠 *AI & INTELIGENCE (15)* 〕─╮
│ !ai     !chatgpt   !img
│ !quote  !wiki      !fact
│ !news   !brain     !remind
│ !ask    !truth     !idea
│ !lang   !gpt4      !weather
╰────────────────────╯

╭─〔 📷 *MEDIA & STICKERS (15)* 〕─╮
│ !sticker  !toimg    !tomp4
│ !tomp3    !emoji    !attp
│ !ttp      !take     !removebg
│ !resize   !invert   !enhance
│ !blur     !mirror   !flip
╰────────────────────╯

╭─〔 🎵 *MUSIC & VIDEO (15)* 〕─╮
│ !play     !ytmp3     !ytmp4
│ !spotify  !lyrics    !video
│ !music    !soundcloud !tiktokmp3
│ !tiktokmp4 !joox     !snapinsta
│ !shazam   !songname  !audiocut
╰────────────────────╯

╭─〔 🛠️ *TOOLS & UTILS (15)* 〕─╮
│ !calc     !translate   !shorten
│ !qr       !github      !pastebin
│ !timer    !screenshot  !write
│ !hack     !trace       !find
│ !converter !ip         !search
╰────────────────────╯

╭─〔 🎉 *FUN & GAMES (15)* 〕─╮
│ !joke     !meme       !dare
│ !truth    !roll       !8ball
│ !gayrate  !rate       !ship
│ !poll     !flirt      !pickup
│ !yesorno  !howhot     !match
╰────────────────────╯

╭─〔 👥 *GROUP ADMIN (15)* 〕─╮
│ !tagall   !hidetag   !kick
│ !add      !promote   !demote
│ !revoke   !grouplink !mute
│ !unmute   !warn      !unwarn
│ !checkwarn !rules     !setname
╰────────────────────╯

╭─〔 🔐 *OWNER ONLY (15)* 〕─╮
│ !shutdown  !restart    !eval
│ !ban       !unban      !setprefix
│ !setppbot  !block      !unblock
│ !backup    !broadcast  !dev
│ !getcode   !setbio     !cleardb
╰────────────────────╯

🔖 *Categories:* General │ AI │ Media │ Music │ Tools │ Fun │ Admin │ Owner  
🌟 Powered by Lexus AI HUB 🌟
`.trim();

    const imageBuffer = fs.readFileSync("./public/lexus AI HUB.png");

    await sock.sendMessage(jid, {
      image: imageBuffer,
      caption: menuText,
    });
  },
};
