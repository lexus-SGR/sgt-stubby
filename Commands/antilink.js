const fs = require("fs");
const path = require("path");

const BRAND = "🤖 *Ben Whittaker Tech*";
const OFFENDERS_FILE = path.join(__dirname, "antilinkOffenders.json");
const MAX_WARNINGS = 3;
const OWNER_NUMBER = process.env.OWNER_NUMBER || "255760317060";
const AUTO_REACT_EMOJI = process.env.AUTO_REACT_EMOJI || "⚠️";

// Load offenders log
let offenders = {};
try {
  offenders = JSON.parse(fs.readFileSync(OFFENDERS_FILE));
} catch {
  fs.writeFileSync(OFFENDERS_FILE, "{}");
}

// Save offenders log
function saveOffenders() {
  fs.writeFileSync(OFFENDERS_FILE, JSON.stringify(offenders, null, 2));
}

module.exports = {
  name: "antilinkPremium",
  execute: async (sock, msg, args, from, sender, isGroup, featureFlags) => {
    if (!isGroup) return;
    if (!featureFlags.antilink.enabled) return;

    const body =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      "";

    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    if (!urlRegex.test(body)) return;

    try {
      const groupMetadata = await sock.groupMetadata(from);
      const isSenderAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin != null;
      const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
      const botIsAdmin = groupMetadata.participants.find(p => p.id === botJid)?.admin != null;

      if (isSenderAdmin) return;

      // Delete message instantly
      try {
        if (botIsAdmin) await sock.sendMessage(from, { delete: msg.key });
      } catch {}

      // Initialize offender
      if (!offenders[from]) offenders[from] = {};
      if (!offenders[from][sender]) offenders[from][sender] = { warned: 0, removed: 0 };

      // Increment warning
      offenders[from][sender].warned += 1;

      // Remove if exceeds max warnings
      if (offenders[from][sender].warned >= MAX_WARNINGS) {
        if (botIsAdmin) {
          await sock.groupParticipantsUpdate(from, [sender], "remove");
          offenders[from][sender].removed += 1;
          offenders[from][sender].warned = 0;

          await sock.sendMessage(from, {
            text: `❌ @${sender.split("@")[0]} removed for posting links too many times!\n` +
                  `Total removals: ${offenders[from][sender].removed}\n\n${BRAND}`,
            mentions: [sender]
          });
        }
      } else {
        await sock.sendMessage(from, {
          text: `⚠️ @${sender.split("@")[0]}, posting links is not allowed!\n` +
                `Warning ${offenders[from][sender].warned}/${MAX_WARNINGS}\n\n${BRAND}`,
          mentions: [sender]
        });
      }

      saveOffenders();

      // Auto react emoji
      if (AUTO_REACT_EMOJI) {
        await sock.sendMessage(from, {
          react: { text: AUTO_REACT_EMOJI, key: msg.key }
        });
      }

    } catch (e) {
      console.error("❌ Premium Antilink error:", e);
      await sock.sendMessage(from, { text: `❌ Error processing link\n${BRAND}` });
    }

    // Auto view status for owner
    if (process.env.AUTO_VIEW_STATUS === "on") {
      try {
        await sock.sendPresenceUpdate("available", OWNER_NUMBER + "@s.whatsapp.net");
      } catch {}
    }
  }
};
