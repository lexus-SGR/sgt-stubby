module.exports = {
  name: "antilinkcheck",
  description: "Check if anti-link is enabled in the group",
  execute: async (sock, msg, from, args, antiLinkGroups) => {
    await sock.sendMessage(from, { react: { text: '🔍', key: msg.key }});
    
    if (!from.endsWith("@g.us")) {
      return await sock.sendMessage(from, { text: "This command works only in groups." }, { quoted: msg });
    }
    
    if (antiLinkGroups.has(from)) {
      await sock.sendMessage(from, { text: "Anti-link protection is ENABLED in this group." }, { quoted: msg });
    } else {
      await sock.sendMessage(from, { text: "Anti-link protection is DISABLED in this group." }, { quoted: msg });
    }
  }
};
