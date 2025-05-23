const fs = require("fs");
const path = require("path");

module.exports = {
  name: "set",
  description: "Turn a feature on or off (updates .env file)",
  emoji: "⚡",
  async execute(sock, msg, args) {
    try {
      if (!args || args.length < 2) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: `❌ Usage: !set FEATURE_NAME on/off`
        });
      }

      const feature = args[0].toUpperCase();
      const value = args[1].toLowerCase();

      if (!["on", "off"].includes(value)) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: `❌ Invalid value. Use "on" or "off" only.`
        });
      }

      const envPath = path.join(__dirname, "..", ".env");
      let envContent = fs.readFileSync(envPath, "utf-8");

      const regex = new RegExp(`^${feature}=.*$`, "m");
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${feature}=${value}`);
      } else {
        envContent += `\n${feature}=${value}`;
      }

      fs.writeFileSync(envPath, envContent);

      await sock.sendMessage(msg.key.remoteJid, {
        react: { text: "✅", key: msg.key }
      });

      await sock.sendMessage(msg.key.remoteJid, {
        text: `✅ *${feature}* has been set to *${value.toUpperCase()}*`
      });

      console.log(`Feature updated: ${feature}=${value}`);
    } catch (err) {
      console.error("Error updating .env:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Failed to update setting.`
      });
    }
  }
};
