const fs = require('fs');
const path = './antilink.json';

if (!fs.existsSync(path)) fs.writeFileSync(path, '{}');

let antiLinkGroups = JSON.parse(fs.readFileSync(path));

module.exports = {
  name: 'antilink',
  description: 'Enable or disable WhatsApp group link detection.',
  category: 'group',
  async execute(sock, msg, args, from, sender, isGroup, groupMetadata, isAdmin) {
    if (!isGroup) {
      return await sock.sendMessage(from, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
    }

    if (!isAdmin) {
      return await sock.sendMessage(from, { text: '❌ Only *group admins* can use this command.' }, { quoted: msg });
    }

    const subCmd = args[0]?.toLowerCase();

    switch (subCmd) {
      case 'on':
        antiLinkGroups[from] = { enabled: true };
        fs.writeFileSync(path, JSON.stringify(antiLinkGroups, null, 2));
        return await sock.sendMessage(from, { text: '✅ Antilink has been *enabled* for this group.' }, { quoted: msg });

      case 'off':
        delete antiLinkGroups[from];
        fs.writeFileSync(path, JSON.stringify(antiLinkGroups, null, 2));
        return await sock.sendMessage(from, { text: '❎ Antilink has been *disabled* for this group.' }, { quoted: msg });

      case 'status':
        const status = antiLinkGroups[from]?.enabled ? '✅ ON' : '❎ OFF';
        return await sock.sendMessage(from, { text: `ℹ️ Antilink status: *${status}*` }, { quoted: msg });

      default:
        return await sock.sendMessage(from, {
          text: 'ℹ️ Usage:\n- *!antilink on* – Enable\n- *!antilink off* – Disable\n- *!antilink status* – Check current status',
        }, { quoted: msg });
    }
  }
};
