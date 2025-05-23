const path = require("path");

module.exports = {
  name: "menu",
  description: "Display the full command list of SPD-XMD Bot",
  emoji: "📑",
  async execute(sock, msg) {
    try {
      const botName = "SPD-XMD";
      const ownerNumber = "255760317060";
      const pushName = msg.pushName || "User";
      const prefix = "!";

      // Time-based greeting with emojis
      const hour = new Date().getHours();
      let greeting = "👋 Hello";
      if (hour >= 4 && hour < 12) greeting = "🌅 Good Morning";
      else if (hour >= 12 && hour < 17) greeting = "☀️ Good Afternoon";
      else if (hour >= 17 && hour < 21) greeting = "🌇 Good Evening";
      else greeting = "🌙 Good Night";

      // Menu text with extended commands list
      const menuText = `
╔═════════════════════════════════════════════════════════════════════════╗
║             ✨🌟✨  WELCOME TO *${botName.toUpperCase()}* BOT ✨🌟✨            ║
╠═════════════════════════════════════════════════════════════════════════╣
║ ${greeting}, *${pushName}*                                                  
║ 📅 Date: ${new Date().toLocaleDateString()}                                   
║ 👑 Owner: wa.me/${ownerNumber}                                             
╠═════════════════════════════════════════════════════════════════════════╣

╭───────────────🔥  GENERAL COMMANDS 🔥───────────────╮
│ 📝 ${prefix}menu           » Show this menu                       │
│ 🥊 ${prefix}ping           » Check bot status                    │
│ 👑 ${prefix}owner          » Bot owner info                      │
│ ⏳ ${prefix}runtime        » Bot uptime                          │
│ ❤️ ${prefix}donate         » Support the bot                     │
│ 📞 ${prefix}callme         » Request a call from owner           │
│ 📢 ${prefix}broadcast      » Send broadcast message              │
╰────────────────────────────────────────────────────────╯

╭───────────────🤖  AI & TECH TOOLS 🤖───────────────╮
│ 🤖 ${prefix}ai             » Chat with AI                       │
│ 🖼️ ${prefix}img            » Generate AI images                 │
│ 🔊 ${prefix}tts            » Text to speech                     │
│ 📄 ${prefix}pdfgen         » Generate PDF files                 │
│ 🎙️ ${prefix}voicegen       » Generate voice notes               │
│ 🧠 ${prefix}chatgpt        » ChatGPT conversation               │
╰────────────────────────────────────────────────────╯

╭───────────────🕌  ISLAMIC COMMANDS 🕌───────────────╮
│ 📖 ${prefix}quran <chapter> » Read Quran chapter               │
│ 🙏 ${prefix}dua            » Show popular dua                   │
│ 🕰️ ${prefix}prayer         » Prayer times & schedule            │
│ 📜 ${prefix}hadith         » Hadith of Prophet Muhammad          │
│ 🕌 ${prefix}islamicquote    » Inspirational Islamic quotes       │
╰────────────────────────────────────────────────────╯

╭───────────────⚽  SPORTS & GAMES ⚽───────────────╮
│ ⚽ ${prefix}scores         » Live match scores                  │
│ 📅 ${prefix}fixtures       » Upcoming matches                   │
│ 🎰 ${prefix}slot           » Slot machine game                  │
│ ❓ ${prefix}truth          » Truth game                         │
│ 🧠 ${prefix}quiz           » Daily quiz                         │
│ 🎮 ${prefix}tictactoe      » Play Tic Tac Toe                   │
│ 🎲 ${prefix}dice           » Roll a dice                       │
╰────────────────────────────────────────────────────╯

╭───────────────📥  DOWNLOADERS 📥───────────────╮
│ 🎵 ${prefix}ytmp3          » Download YouTube MP3               │
│ 🎬 ${prefix}tiktok         » Download TikTok videos             │
│ 📘 ${prefix}facebook       » Download Facebook videos           │
│ 📺 ${prefix}spotify        » Download Spotify tracks            │
│ 📱 ${prefix}igstory        » Download Instagram story           │
╰────────────────────────────────────────────────╯

╭───────────────🛡️  SECURITY & UTILITY 🛡️───────────────╮
│ 🚫 ${prefix}block          » Block a user                       │
│ ✅ ${prefix}unblock        » Unblock a user                     │
│ ⚙️ ${prefix}setprefix      » Change command prefix             │
│ ☁️ ${prefix}weather        » Weather info                       │
│ 🕵️‍♂️ ${prefix}whois         » Whois lookup                      │
│ 🔍 ${prefix}google         » Google search                      │
╰────────────────────────────────────────────────────╯

╭───────────────🎉  FUN & ENTERTAINMENT 🎉───────────────╮
│ 😂 ${prefix}joke           » Random joke                       │
│ 🐦 ${prefix}meme           » Random meme                       │
│ ❤️ ${prefix}love          » Love calculator                   │
│ 🐱 ${prefix}cat            » Random cat image                  │
│ 🐶 ${prefix}dog            » Random dog image                  │
│ 🗣️ ${prefix}simi           » Chat with simi bot                │
╰────────────────────────────────────────────────────╯

╭───────────────🛠️  TOOLS & OTHERS 🛠️───────────────╮
│ 📝 ${prefix}reminder       » Set a reminder                    │
│ ⏰ ${prefix}timer          » Set a timer                       │
│ 📅 ${prefix}calendar       » Show calendar                    │
│ 🗂️ ${prefix}notes          » Manage notes                      │
│ 🔢 ${prefix}calc           » Calculator                       │
│ 🌐 ${prefix}translate      » Translate text                    │
╰────────────────────────────────────────────────────╯

╔═════════════════════════════════════════════════════════════════════════╗
║               ✨✨ THANK YOU FOR USING *${botName}* BOT! ✨✨               ║
║              📦 GitHub: https://github.com/lexus-SGR/sgt-stubby.git        ║
╚═════════════════════════════════════════════════════════════════════════╝
      `;

      // Send the benwhittaker.png image with caption
      const imagePath = path.resolve(__dirname, "./media/benwhittaker.png");

      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: imagePath },
        caption: menuText,
      });

      // Reaction emoji
      await sock.sendMessage(msg.key.remoteJid, {
        react: { text: "📑", key: msg.key },
      });

    } catch (error) {
      console.error("Error sending menu:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Sorry, could not send the menu right now.",
      });
    }
  },
};
