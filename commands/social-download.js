const axios = require('axios');

module.exports = {
  tiktok: {
    name: "tiktok",
    description: "Download TikTok video without watermark.",
    emoji: "🎶",
    async execute(sock, msg, args) {
      if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: "Send TikTok video link." });
      const url = args[0];

      try {
        const res = await axios.get(`https://api.tiktokdownloader.com/api?url=${encodeURIComponent(url)}`);
        const videoUrl = res.data.video_no_watermark;
        if (!videoUrl) return sock.sendMessage(msg.key.remoteJid, { text: "Failed to get TikTok video." });

        await sock.sendMessage(msg.key.remoteJid, {
          video: { url: videoUrl },
          mimetype: "video/mp4",
          caption: "TikTok video"
        });
      } catch {
        await sock.sendMessage(msg.key.remoteJid, { text: "Error downloading TikTok video." });
      }
    }
  },

  facebook: {
    name: "fb",
    description: "Download Facebook video.",
    emoji: "📘",
    async execute(sock, msg, args) {
      if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: "Send Facebook video link." });
      const url = args[0];

      try {
        const res = await axios.get(`https://fbdownloader.example/api?url=${encodeURIComponent(url)}`);
        const videoUrl = res.data.url;
        if (!videoUrl) return sock.sendMessage(msg.key.remoteJid, { text: "Failed to get Facebook video." });

        await sock.sendMessage(msg.key.remoteJid, {
          video: { url: videoUrl },
          mimetype: "video/mp4",
          caption: "Facebook video"
        });
      } catch {
        await sock.sendMessage(msg.key.remoteJid, { text: "Error downloading Facebook video." });
      }
    }
  },

  instagram: {
    name: "ig",
    description: "Download Instagram video or reels.",
    emoji: "📸",
    async execute(sock, msg, args) {
      if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: "Send Instagram link." });
      const url = args[0];

      try {
        const res = await axios.get(`https://api.instagramdownloader.com/api?url=${encodeURIComponent(url)}`);
        const videoUrl = res.data.video;
        if (!videoUrl) return sock.sendMessage(msg.key.remoteJid, { text: "Failed to get Instagram video." });

        await sock.sendMessage(msg.key.remoteJid, {
          video: { url: videoUrl },
          mimetype: "video/mp4",
          caption: "Instagram video"
        });
      } catch {
        await sock.sendMessage(msg.key.remoteJid, { text: "Error downloading Instagram video." });
      }
    }
  },

  twitter: {
    name: "twitter",
    description: "Download Twitter video.",
    emoji: "🐦",
    async execute(sock, msg, args) {
      if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: "Send Twitter link." });
      const url = args[0];

      try {
        const res = await axios.get(`https://api.twittervideodownloader.com/api?url=${encodeURIComponent(url)}`);
        const videoUrl = res.data.video;
        if (!videoUrl) return sock.sendMessage(msg.key.remoteJid, { text: "Failed to get Twitter video." });

        await sock.sendMessage(msg.key.remoteJid, {
          video: { url: videoUrl },
          mimetype: "video/mp4",
          caption: "Twitter video"
        });
      } catch {
        await sock.sendMessage(msg.key.remoteJid, { text: "Error downloading Twitter video." });
      }
    }
  }
};
