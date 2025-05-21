module.exports = {
  name: "owner",
  description: "Get the owner's contact info.",
  emoji: "👑",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, { react: { text: "👑", key: msg.key } });
    const ownerJid = "255760317060@s.whatsapp.net"; // your owner number
    await sock.sendMessage(msg.key.remoteJid, {
      contacts: { 
        displayName: "Bot Owner", 
        contacts: [{ 
          vcard: `BEGIN:VCARD
VERSION:3.0
FN:Bot Owner
TEL;waid=${ownerJid.split("@")[0]}:${ownerJid.split("@")[0]}
END:VCARD`
        }]
      }
    });
  }
};
