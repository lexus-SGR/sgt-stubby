module.exports = {
  name: 'unblockuser',
  description: 'Unblock a user',
  async execute(msg, args) {
    const number = args[0];
    if (!number) return msg.reply('Provide a number to unblock.');
    global.blocked = global.blocked || [];
    global.blocked = global.blocked.filter(n => n !== number);
    msg.reply(`User ${number} has been unblocked.`);
  }
};
