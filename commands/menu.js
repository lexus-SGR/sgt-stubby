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

    const techMenu = `
╭━━〔 *SPD-XMD BOT MENU* 〕━━╮
│ *User:* ${pushName}
│ *Bot:* ${botName}
│ *Owner:* wa.me/${ownerNumber}
│ *Date:* ${new Date().toLocaleDateString()}
╰━━━━━━━━━━━━━━━━━━━━━━╯

───❖ *[ GENERAL COMMANDS ]* ❖───
${prefix}ping     🥊 Check bot status  
${prefix}menu     📑 View all features  
${prefix}owner    👑 Bot Owner  
${prefix}runtime  ⏳ Bot Uptime  
${prefix}speed    🚀 Bot Speed  
${prefix}donate   ❤️ Support Bot  
${prefix}alive    ☑️ Bot Online Check  
${prefix}info     ℹ️ Bot Info  
${prefix}report   📝 Report Bug  

───❖ *[ AI & TECH TOOLS ]* ❖───
${prefix}ai           🤖 ChatGPT Response  
${prefix}img          🧠 AI Image Generator  
${prefix}code         💻 AI Code Helper  
${prefix}pdf          📄 PDF Converter  
${prefix}qrcode       🔳 QR Generator  
${prefix}scanqr       🔍 QR Code Reader  
${prefix}translate    🌐 Translate Text  
${prefix}meme         😂 Random Memes  
${prefix}tts          🔊 Text-to-Speech  
${prefix}voicemaster  🗣 Voice Edit AI  

───❖ *[ DOWNLOADERS ]* ❖───
${prefix}ytmp3     🎵 YouTube MP3  
${prefix}ytmp4     🎬 YouTube Video  
${prefix}tiktok    🎶 TikTok No Watermark  
${prefix}fb        📘 Facebook Video  
${prefix}ig        📸 Instagram Reels  
${prefix}twitter   🐦 Twitter Video  
${prefix}pinterest 📍 Pinterest Image  
${prefix}mediafire 📥 Mediafire Link  
${prefix}apk       📱 APK Downloader  
${prefix}soundcloud 🎧 MP3 from SoundCloud  

───❖ *[ GROUP/ADMIN TOOLS ]* ❖───
${prefix}antilink     🔗 Anti Group Link  
${prefix}kick         👢 Remove Member  
${prefix}add          ➕ Add Member  
${prefix}promote      📈 Make Admin  
${prefix}demote       📉 Remove Admin  
${prefix}tagall       🗣 Tag Everyone  
${prefix}hidetag      🫣 Hide Mention  
${prefix}welcome on/off ✋ Welcome Msg  
${prefix}group open/close 🔐 Group Lock  

───❖ *[ GAMES & FUN ]* ❖───
${prefix}truth       ❓ Truth Game  
${prefix}dare        ⚠️ Dare Game  
${prefix}guess       🎯 Guess the Word  
${prefix}tictactoe   ❎ TicTacToe Game  
${prefix}maths       ➗ Math Challenge  
${prefix}riddle      🧠 Brain Teaser  
${prefix}slot        🎰 Slot Machine  
${prefix}quotes      💬 Life Quotes  
${prefix}quiz        🧩 Daily Quiz  
${prefix}fact        📚 Random Fact  

───❖ *[ SECURITY & UTILITY ]* ❖───
${prefix}block       🚫 Block User  
${prefix}unblock     ✅ Unblock User  
${prefix}ban         🔨 Ban User  
${prefix}unban       🆓 Unban User  
${prefix}antilink    🔗 Block Links  
${prefix}setprefix   🔧 Custom Prefix  
${prefix}setbio      📝 Set Group Bio  
${prefix}warn        ⚠️ Warn Member  
${prefix}lockcmd     🔒 Lock Command  
${prefix}checkcmd    🔍 Check Command  

───❖ *[ TOOLS & INTERNET ]* ❖───
${prefix}shorturl    🔗 Shorten URL  
${prefix}weather     ☁️ Weather Info  
${prefix}calc        🧮 Calculator  
${prefix}lyrics      🎤 Get Song Lyrics  
${prefix}reminder    ⏰ Set Reminder  
${prefix}gsearch     🌍 Google Search  
${prefix}wikipedia   📘 Wiki Summary  
${prefix}news        📰 Global News  
${prefix}covid       🦠 COVID Update  
${prefix}currency    💱 Exchange Rates  

────────────────────────────
📦 GitHub: https://github.com/lexus-SGR/sgt-stubby.git
    `;
categories.forEach(({ icon, title, commands }) => {
    menuMessage += `╔══════════════════════════════╗
║ ${icon}  ${title}
╚══════════════════════════════╝
`;
    commands.forEach(({ cmd, desc }, i) => {
      menuMessage += `${i + 1}. 🔹 *${cmd}*\n   _${desc}_\n`;
    });
    menuMessage += "\n";
  });

  menuMessage += `╔══════════════════════════════╗
║ Thank you for using ${botName}!  
╚══════════════════════════════╝
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
