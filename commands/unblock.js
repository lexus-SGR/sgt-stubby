module.exports = {
  name: "unblock",
  description: "Unblock a user by their WhatsApp ID",
  execute: async (sock, msg, from, args) => {
    await sock.sendMessage(from, { react: { text: '✅', key: msg.key }});
    if (!args[0]) {
      return await sock.sendMessage(from, { text: "Please provide the number to unblock (e.g., 123456789@s.whatsapp.net)." }, { quoted: msg });
    }
    const jidToUnblock = args[0].includes("@") ? args[0] : `${args[0]}@s.whatsapp.net`;
    try {
      await sock.updateBlockStatus(jidToUnblock, "unblock");
      await sock.sendMessage(from, { text: `User ${jidToUnblock} has been unblocked.` }, { quoted: msg });
    } catch (e) {
      await sock.sendMessage(from, { text: `Failed to unblock ${jidToUnblock}.` }, { quoted: msg });
    }
  }
};
