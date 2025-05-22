const fs = require("fs");
const path = require("path");

module.exports = {
  name: "menu",
  alias: ["help", "commands", "menutech"],
  desc: "Display the full command list of SPD-XMD Bot",
  category: "main",
  async execute(m, { sock, command, prefix, pushName }) {
    const menuImage = fs.readFileSync(path.join(__dirname, "lexus AI HUB.png"));
    const audioFile = fs.readFileSync(path.join(__dirname, "solitary.mp3"));
    const botName = "SPD-XMD";
    const ownerNumber = "255760317060";

    let techMenu = `
╭━━〔 *SPD-XMD BOT MENU* 〕━━╮
│ *User:* ${pushName}
│ *Bot:* ${botName}
│ *Owner:* wa.me/${ownerNumber}
│ *Date:* ${new Date().toLocaleDateString()}
╰━━━━━━━━━━━━━━━━━━━━━━╯

───❖ *[ GENERAL COMMANDS ]* ❖───
${📌}ping     🥊 Check bot status  
${📌}menu     📑 View all features  
${📌}owner    👑 Bot Owner  
${📌}runtime  ⏳ Bot Uptime  
${📌}speed    🚀 Bot Speed  
${📌}donate   ❤️ Support Bot  
${📌}alive    ☑️ Bot Online Check  
${📌}info     ℹ️ Bot Info  
${📌}report   📝 Report Bug  

───❖ *[ AI & TECH TOOLS ]* ❖───
${📌}ai           🤖 ChatGPT Response  
${📌}img          🧠 AI Image Generator  
${📌}code         💻 AI Code Helper  
${📌}pdf          📄 PDF Converter  
${📌}qrcode       🔳 QR Generator  
${📌}scanqr       🔍 QR Code Reader  
${📌}translate    🌐 Translate Text  
${📌}meme         😂 Random Memes  
${📌}tts          🔊 Text-to-Speech  
${📌}voicemaster  🗣 Voice Edit AI  

───❖ *[ DOWNLOADERS ]* ❖───
${📌}ytmp3     🎵 YouTube MP3  
${📌}ytmp4     🎬 YouTube Video  
${📌}tiktok    🎶 TikTok No Watermark  
${📌}fb        📘 Facebook Video  
${📌}ig        📸 Instagram Reels  
${📌}twitter   🐦 Twitter Video  
${📌}pinterest 📍 Pinterest Image  
${📌}mediafire 📥 Mediafire Link  
${📌}apk       📱 APK Downloader  
${📌}soundcloud 🎧 MP3 from SoundCloud  

───❖ *[ GROUP/ADMIN TOOLS ]* ❖───
${📌}antilink     🔗 Anti Group Link  
${📌}kick         👢 Remove Member  
${📌}add          ➕ Add Member  
${📌}promote      📈 Make Admin  
${📌}demote       📉 Remove Admin  
${📌}tagall       🗣 Tag Everyone  
${📌}hidetag      🫣 Hide Mention  
${📌}welcome on/off ✋ Welcome Msg  
${📌}group open/close 🔐 Group Lock  

───❖ *[ GAMES & FUN ]* ❖───
${📌}truth       ❓ Truth Game  
${📌}dare        ⚠️ Dare Game  
${📌}guess       🎯 Guess the Word  
${📌}tictactoe   ❎ TicTacToe Game  
${📌}maths       ➗ Math Challenge  
${📌}riddle      🧠 Brain Teaser  
${📌}slot        🎰 Slot Machine  
${📌}quotes      💬 Life Quotes  
${📌}quiz        🧩 Daily Quiz  
${📌}fact        📚 Random Fact  

───❖ *[ SECURITY & UTILITY ]* ❖───
${📌}block       🚫 Block User  
${📌}unblock     ✅ Unblock User  
${📌}ban         🔨 Ban User  
${📌}unban       🆓 Unban User  
${📌}antilink    🔗 Block Links  
${📌}setprefix   🔧 Custom Prefix  
${📌}setbio      📝 Set Group Bio  
${📌}warn        ⚠️ Warn Member  
${📌}lockcmd     🔒 Lock Command  
${📌}checkcmd    🔍 Check Command  

───❖ *[ TOOLS & INTERNET ]* ❖───
${📌}shorturl    🔗 Shorten URL  
${📌}weather     ☁️ Weather Info  
${📌}calc        🧮 Calculator  
${📌}lyrics      🎤 Get Song Lyrics  
${📌}reminder    ⏰ Set Reminder  
${📌}gsearch     🌍 Google Search  
${📌}wikipedia   📘 Wiki Summary  
${📌}news        📰 Global News  
${📌}covid       🦠 COVID Update  
${📌}currency    💱 Exchange Rates  

╔══════════════════════════════╗
║ Thank you for using ${botName}!
╚══════════════════════════════╝

📦 GitHub: https://github.com/lexus-SGR/sgt-stubby.git
    `;

    await sock.sendMessage(m.chat, {
      image: menuImage,
      caption: techMenu,
      audio: audioFile,
      mimetype: "audio/mp3",
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: "SPD-XMD WhatsApp Bot",
          body: "AI | Downloaders | Tools | Security",
          mediaType: 1,
          thumbnail: menuImage,
          renderLargerThumbnail: true,
          sourceUrl: "https://github.com/lexus-SGR/sgt-stubby.git"
        }
      }
    });
  },
};
