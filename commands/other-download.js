const axios = require('axios');

module.exports = {
  mediafire: {
    name: "mediafire",
    description: "Get download link from Mediafire.",
    emoji: "📥",
    async execute(sock, msg, args) {
      if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: "Send Mediafire link." });
      const url = args[0];

      try {
        const res = await axios.get(`https://api.mediafiredownloader.com/api?url=${encodeURIComponent(url)}`);
        const downloadUrl = res.data.download;
        if (!downloadUrl) return sock.sendMessage(msg.key.remoteJid, { text: "Failed to get Mediafire download link." });

        await sock.sendMessage(msg.key.remoteJid, { text: `Download link: ${downloadUrl}` });
      } catch {
        await sock.sendMessage(msg.key.remoteJid, { text: "Error fetching Mediafire link." });
      }
    }
  },

  pinterest: {
    name: "pinterest",
    description: "Download image from Pinterest.",
    emoji: "📍",
    async execute(sock, msg, args) {
      if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: "Send Pinterest image link." });
      const url = args[0];

      try {
        const res = await axios.get(`https://api.pinterestdownloader.com/api?url=${encodeURIComponent(url)}`);
        const imageUrl = res.data.image;
        if (!imageUrl) return sock.sendMessage(msg.key.remoteJid, { text: "Failed to get Pinterest image." });

        await sock.sendMessage(msg.key.remoteJid, {
          image: { url: imageUrl },
          caption: "Pinterest image"
        });
      } catch {
        await sock.sendMessage(msg.key.remoteJid, { text: "Error downloading Pinterest image." });
      }
    }
  },

  soundcloud: {
    name: "soundcloud",
    description: "Download SoundCloud audio.",
    emoji: "🎧",
    async execute(sock, msg, args) {
      if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: "Send SoundCloud link." });
      const url = args[0];

      try {
        const res = await axios.get(`https://api.soundclouddownloader.com/api?url=${encodeURIComponent(url)}`);
        const audioUrl = res.data.audio;
        if (!audioUrl) return sock.sendMessage(msg.key.remoteJid, { text: "Failed to get SoundCloud audio." });

        await sock.sendMessage(msg.key.remoteJid, {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          caption: "SoundCloud audio"
        });
      } catch {
        await sock.sendMessage(msg.key.remoteJid, { text: "Error downloading SoundCloud audio." });
      }
    }
  },

  apk: {
    name: "apk",
    description: "Send APK download link.",
    emoji: "📱",
    async execute(sock, msg, args) {
      if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: "Send APK download link." });
      const url = args[0
