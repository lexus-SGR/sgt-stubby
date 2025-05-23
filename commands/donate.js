const fs = require("fs");
const path = require("path");

module.exports = {
  name: "donate",
  description: "Support the bot developer.",
  emoji: "❤️",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, { react: { text: "❤️", key: msg.key } });

    const donateImage = fs.readFileSync(path.join(__dirname, "lexus AI HUB.png"));

    const donationMsg = `
╭─❖ *DONATE TO SPD-XMD* ❖─╮
│ 🤖 Bot: SPD-XMD
│ 🆔 Developer: wa.me/255760317060
│ 💼 GitHub: github.com/lexus-SGR/sgt-stubby.git
│ 
│ 💳 *Support via Mobile Money:*
│ - Tigo Pesa: 0654 478 605
│ - Halotel Money: 0624 236 654
│ - Vodacom M-Pesa: 0760 317 060
│ 
│ 🙏 Your support keeps this bot running!
╰────────────────────────╯

*Thank you for using SPD-XMD Bot!*
    `;

    await sock.sendMessage(msg.key.remoteJid, {
      image: donateImage,
      caption: donationMsg,
      footer: "Click the button below to contact developer",
      buttons: [
        {
          buttonId: "owner",
          buttonText: { displayText: "Contact Developer" },
          type: 1,
        },
      ],
      headerType: 4,
    });
  }
};
