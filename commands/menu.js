module.exports = {
  name: "menu",
  description: "Display the full command list of SPD-XMD Bot",
  emoji: "📘",
  async execute(sock, msg) {
    try {
      const botName = "SPD-XMD";
      const ownerNumber = "255760317060";
      const pushName = msg.pushName || "User";
      const prefix = "!";
      const hour = new Date().getHours();

      let greeting = "👋 Hello";
      if (hour >= 4 && hour < 12) greeting = "🌅 Good Morning";
      else if (hour >= 12 && hour < 17) greeting = "☀️ Good Afternoon";
      else if (hour >= 17 && hour < 21) greeting = "🌇 Good Evening";
      else greeting = "🌙 Good Night";

      const menuText = `
╔════════════════════════════════════════╗
║      📘✨ ${botName.toUpperCase()} COMMAND MENU ✨📘       ║
╠════════════════════════════════════════╣
║ ${greeting}, *${pushName}*
║ 📅 Date: ${new Date().toLocaleDateString()}
║ 👑 Owner: wa.me/${ownerNumber}
╚════════════════════════════════════════╝

╭─🔷 GENERAL COMMANDS 🔷───────────────╮
│ 📝 ${prefix}menu         » Show this menu         
│ 🥊 ${prefix}ping         » Check bot status       
│ 👑 ${prefix}owner        » Bot owner info         
│ ⏳ ${prefix}runtime      » Bot uptime             
│ ❤️ ${prefix}donate       » Support the bot        
╰──────────────────────────────────────╯

╭─🔹 AI & TECH TOOLS 🔹───────────────╮
│ 🤖 ${prefix}ai           » Chat with AI           
│ 🖼️ ${prefix}img          » Generate AI images     
│ 🔊 ${prefix}tts          » Text to speech         
│ 📄 ${prefix}pdfgen       » Make PDF file          
│ 🎙️ ${prefix}voicegen     » Create voice notes     
│ 🧠 ${prefix}chatgpt      » ChatGPT conversation   
╰──────────────────────────────────────╯

╭─🔷 ISLAMIC COMMANDS 🔷──────────────╮
│ 📖 ${prefix}quran <sura> » Quran sura         
│ 🙏 ${prefix}dua          » Dua list           
│ 🕰️ ${prefix}prayer       » Prayer times       
│ 📜 ${prefix}hadith       » Hadiths            
╰────────────────────────────────────╯

╭─🔹 SPORTS & GAMES 🔹───────────────╮
│ ⚽ ${prefix}scores       » Match scores         
│ 📅 ${prefix}fixtures     » Upcoming games       
│ ❓ ${prefix}truth        » Truth game           
│ 🎰 ${prefix}slot         » Slot game            
│ 🧠 ${prefix}quiz         » Quiz game            
│ 🎮 ${prefix}tictactoe    » Play Tic Tac Toe     
│ 🎲 ${prefix}dice         » Roll a dice          
╰────────────────────────────────────╯

╭─🔷 DOWNLOADERS 🔷───────────────╮
│ 🎵 ${prefix}ytmp3        » YouTube to MP3       
│ 🎬 ${prefix}tiktok       » TikTok downloader     
│ 📘 ${prefix}facebook     » FB video download     
│ 📱 ${prefix}instagram    » Insta story download  
│ 🎧 ${prefix}spotify      » Spotify downloader    
╰────────────────────────────────────╯

╭─🔹 MUSIC COMMANDS 🔹───────────────╮
│ ▶️ ${prefix}play          » Play song from YouTube
│ ⏸️ ${prefix}pause         » Pause current song    
│ ⏹️ ${prefix}stop          » Stop music playback   
│ 🔉 ${prefix}volume <1-100>» Set volume           
│ ⏭️ ${prefix}skip          » Skip current song     
╰────────────────────────────────────╯

╭─🔷 STICKERS & IMAGES 🔷───────────────╮
│ 🖼️ ${prefix}sticker       » Make sticker from image/video
│ 🔄 ${prefix}toimg         » Sticker to image       
│ 🎭 ${prefix}emoji         » Create emoji sticker   
│ 🖌️ ${prefix}paint         » Paint on image         
│ 🔍 ${prefix}resize        » Resize image           
╰────────────────────────────────────╯

╭─🔹 SECURITY & ADMIN 🔹───────────────╮
│ 🚫 ${prefix}block        » Block user           
│ ✅ ${prefix}unblock      » Unblock user         
│ ⚙️ ${prefix}setprefix    » Set bot prefix       
│ 🧾 ${prefix}antilink on  » Enable antilink 🔗    
│ ❌ ${prefix}antilink off » Disable antilink      
│ 👥 ${prefix}add          » Add user to group    
│ ❌ ${prefix}kick         » Remove user from group
│ 🔇 ${prefix}mute         » Mute group           
│ 🔊 ${prefix}unmute       » Unmute group         
╰────────────────────────────────────╯

╭─🔷 FUN & ENTERTAINMENT 🔷───────────────╮
│ 🐶 ${prefix}dog          » Dog image            
│ 🐱 ${prefix}cat          » Cat image            
│ 🗣️ ${prefix}simi         » Chat with simi       
│ 😂 ${prefix}joke         » Joke of the day      
│ ❤️ ${prefix}love         » Love calculator      
│ 🎤 ${prefix}sing         » Bot sings a song     
╰────────────────────────────────────╯

╭─🔹 TOOLS & UTILITY 🔹───────────────╮
│ 🧮 ${prefix}calc         » Calculator            
│ 🌐 ${prefix}translate    » Translate text        
│ ⏰ ${prefix}timer        » Set timer             
│ 🗓️ ${prefix}calendar     » View calendar         
│ 📝 ${prefix}notes        » Save notes            
╰────────────────────────────────────╯

╭─🔵 LINKS 🔵──────────────────────────╮
│ 🛠️ GitHub: github.com/lexus-SGR
│ 🧑‍💻 Powered by: ${botName}
╰────────────────────────────────────╯
`;

      await sock.sendMessage(msg.key.remoteJid, {
        text: menuText,
      });

      await sock.sendMessage(msg.key.remoteJid, {
        react: { text: "📘", key: msg.key },
      });

    } catch (error) {
      console.error("Menu error:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Menu haikufunguka kwa sasa.",
      });
    }
  },
};
