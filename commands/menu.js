module.exports = {
  name: "menu",
  description: "Show full list of bot commands",
  emoji: "📜",
  async execute(sock, msg) {
    const from = msg.key.remoteJid;

    const menuText = `
🩷🧡💛💫🌸🌟━━━🌟🌸💫💛🧡🩷  
*『  𝓑𝓮𝓷 𝓦𝓱𝓲𝓽𝓽𝓪𝓴𝓮𝓻 𝓣𝓮𝓬𝓱 』*
📱 *𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗔𝘀𝘀𝗶𝘀𝘁𝗮𝗻𝘁*  
✨ *200+ Features | AI | Islamic | Fun*  
🩷🧡💛💫🌸🌟━━━🌟🌸💫💛🧡🩷  

🧠 *𝗔𝗜 & 𝗧𝗼𝗼𝗹𝘀*  
*┃* !ai [question]  
*┃* !gpt4 [question]  
*┃* !image [prompt]  
*┃* !draw [prompt]  
*┃* !code [description]  
*┃* !translate [language]  
*┃* !brainstorm [topic]  
*┃* !summarize [text]  
*┃* !weather [city]  
*┃* !define [word]  
*┃* !news  
*┃* !math [calculation]  
*┃* !search [query]  
*┃* !chatpdf [reply pdf]  
*┃* !qr [text/url]  

🎵 *𝗠𝗲𝗱𝗶𝗮 & 𝗠𝘂𝘀𝗶𝗰*  
*┃* !ytmp3 [url]  
*┃* !ytmp4 [url]  
*┃* !play [title]  
*┃* !video [title]  
*┃* !spotify [link]  
*┃* !deezer [link]  
*┃* !lyrics [title]  
*┃* !ringtone [name]  
*┃* !voice [text]  
*┃* !audiotrim [sec]  
*┃* !bass [reply audio]  
*┃* !slow [reply audio]  
*┃* !fast [reply audio]  
*┃* !vn [reply audio]  
*┃* !tomp3 [reply video]  

🎭 *𝗙𝘂𝗻 & 𝗦𝘁𝗶𝗰𝗸𝗲𝗿𝘀*  
*┃* !joke  
*┃* !meme  
*┃* !sticker  
*┃* !stickertext [text]  
*┃* !emojimix [emoji+emoji]  
*┃* !ascii [text]  
*┃* !truth  
*┃* !dare  
*┃* !quote  
*┃* !fact  
*┃* !ghosttext [text]  
*┃* !lovemeter  
*┃* !ship [@user1] [@user2]  
*┃* !rate [@user]  
*┃* !fakecall  

🕌 *𝗜𝘀𝗹𝗮𝗺𝗶𝗰*  
*┃* !quran [sura] [aya]  
*┃* !quranAudio [sura]  
*┃* !hadith  
*┃* !hadithAudio  
*┃* !dua  
*┃* !duaaudio  
*┃* !prayer [city]  
*┃* !azan [city]  
*┃* !99names  
*┃* !zikr  
*┃* !salahtimes [city]  
*┃* !surahlist  
*┃* !hijridate  
*┃* !randomayah  
*┃* !tafsir [sura:aya]  

⚙️ *𝗚𝗿𝗼𝘂𝗽 & 𝗔𝗱𝗺𝗶𝗻*  
*┃* !kick [@user]  
*┃* !promote [@user]  
*┃* !demote [@user]  
*┃* !antilink on/off  
*┃* !welcome on/off  
*┃* !autosticker on/off  
*┃* !group open/close  
*┃* !tagall  
*┃* !hidetag [msg]  
*┃* !setname [name]  
*┃* !setdesc [desc]  
*┃* !setppgroup  
*┃* !linkgroup  
*┃* !revoke  
*┃* !admins  

🛡️ *𝗦𝗲𝗰𝘂𝗿𝗶𝘁𝘆*  
*┃* !banword add/remove [word]  
*┃* !antifake on/off  
*┃* !antiviewonce on/off  
*┃* !antidelete on/off  
*┃* !antiimage on/off  
*┃* !antivideo on/off  

👑 *𝗢𝘄𝗻𝗲𝗿 & 𝗦𝘆𝘀𝘁𝗲𝗺*  
*┃* !eval [code]  
*┃* !exec [cmd]  
*┃* !restart  
*┃* !shutdown  
*┃* !setpp  
*┃* !join [group link]  
*┃* !leave [group]  
*┃* !block [@user]  
*┃* !unblock [@user]  
*┃* !broadcast [msg]  
*┃* !bcimage [reply img]  
*┃* !feature on/off [name]  
*┃* !ban [@user]  
*┃* !unban [@user]  
*┃* !uptime  

🩷🧡💛💫🌸🌟━━━🌟🌸💫💛🧡🩷  
     *𝗣𝗥𝗘𝗙𝗜𝗫: !*  
     *𝗢𝗪𝗡𝗘𝗥: wa.me/255760317060*  
     *© 𝟮𝟬𝟮𝟱 𝗕𝗲𝗻 𝗪𝗵𝗶𝘁𝘁𝗮𝗸𝗲𝗿 𝗧𝗲𝗰𝗵*  

💠 *𝗧𝗵𝗲 𝗠𝗼𝘀𝘁 𝗔𝗱𝘃𝗮𝗻𝗰𝗲𝗱 𝗕𝗼𝘁 𝗘𝘃𝗲𝗿*  
🌟 *𝗨𝗹𝘁𝗿𝗮-𝗙𝗮𝘀𝘁. 𝗨𝗹𝘁𝗿𝗮-𝗦𝗺𝗮𝗿𝘁. 𝗨𝗹𝘁𝗿𝗮-𝗖𝗼𝗼𝗹.*  
🌹 *𝗧𝗵𝗮𝗻𝗸 𝗬𝗼𝘂 𝗙𝗼𝗿 𝗨𝘀𝗶𝗻𝗴 𝗕𝗲𝗻 𝗪𝗵𝗶𝘁𝘁𝗮𝗸𝗲𝗿 𝗧𝗲𝗰𝗵!*  
🩷🧡💛💫🌸🌟━━━🌟🌸💫💛🧡🩷
    `;

    await sock.sendMessage(from, { text: menuText });
  }
};
