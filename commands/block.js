module.exports = {
  name: "block",
  description: "Block a user by their WhatsApp ID",
  execute: async (sock, msg, from, args) => {
    await sock.sendMessage(from, { react: { text: '⛔', key: msg.key }});
    if (!args[0]) {
      return await sock.sendMessage(from, { text: "Please provide the number to block (e.g., 123456789@s.whatsapp.net)." }, { quoted: msg });
    }
    const jidToBlock = args[0].includes("@") ? args[0] : `${args[0]}@s.whatsapp.net`;
    try {
      await sock.updateBlockStatus(jidToBlock, "block");
      await sock.sendMessage(from, { text: `User ${jidToBlock} has been blocked.` }, { quoted: msg });
    } catch (e) {
      await sock.sendMessage(from, { text: `Failed to block ${jidToBlock}.` }, { quoted: msg });
    }
  }
};
