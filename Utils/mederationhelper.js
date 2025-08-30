const fs = require("fs");
const BRAND = "🤖 Uknown-corps Tech";

let warnCount = {};
try { warnCount = JSON.parse(fs.readFileSync("warns.json")); } catch { fs.writeFileSync("warns.json", "{}"); }

function saveWarns() { fs.writeFileSync("warns.json", JSON.stringify(warnCount, null, 2)); }

module.exports = async function handleModeration(sock, msg, from, sender, number, featureFlags) {
  if (!warnCount[number]) warnCount[number] = 0;
  warnCount[number] += 1;
  saveWarns();

  // Delete message
  await sock.sendMessage(from, { delete: msg.key });

  // Warn message
  await sock.sendMessage(from, {
    text: `⚠️ @${number}, you violated rules!\nWarn: ${warnCount[number]}/${featureFlags.warnLimit || 3}\n${BRAND}`,
    mentions: [sender]
  });

  // Auto react emoji
  if (process.env.AUTO_REACT_EMOJI) {
    await sock.sendMessage(from, { react: { text: process.env.AUTO_REACT_EMOJI, key: msg.key } });
  }

  // Remove user if warn limit reached
  if (warnCount[number] >= (featureFlags.warnLimit || 3) && featureFlags.autoRemove?.enabled) {
    await sock.groupParticipantsUpdate(from, [sender], "remove");
    warnCount[number] = 0;
    saveWarns();
    await sock.sendMessage(from, { text: `❌ @${number} removed after reaching warn limit!\n${BRAND}`, mentions: [sender] });
  }
};
