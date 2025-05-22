module.exports = {
  name: 'antilink',
  description: 'Turn antilink protection on or off in group',
  category: 'group',
  async execute(sock, msg, args) {
    const { from, isGroup, isGroupAdmin, body, sender } = msg;

    if (!isGroup) {
      await sock.sendMessage(from, { text: '❌ This command is only for groups.' }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
      return;
    }

    if (!isGroupAdmin) {
      await sock.sendMessage(from, { text: '⛔ Only admins can use this command.' }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: '⛔', key: msg.key } });
      return;
    }

    if (!args[0]) {
      await sock.sendMessage(from, { text: 'ℹ️ Usage: !antilink on / off' }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: 'ℹ️', key: msg.key } });
      return;
    }

    if (!global.antilink) global.antilink = {};

    const setting = args[0].toLowerCase();
    if (setting === 'on') {
      global.antilink[from] = true;
      await sock.sendMessage(from, { text: '✅ Antilink enabled! Group links will be blocked.' }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
    } else if (setting === 'off') {
      delete global.antilink[from];
      await sock.sendMessage(from, { text: '❌ Antilink disabled.' }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
    } else {
      await sock.sendMessage(from, { text: '⚠️ Use: !antilink on / off' }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: '⚠️', key: msg.key } });
    }
  }
}
