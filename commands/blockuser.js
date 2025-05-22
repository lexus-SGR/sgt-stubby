module.exports = {
  name: 'blockuser',
  description: 'Block a user from using the bot',
  async execute(msg, args) {
    const number = args[0];
    if (!number) return msg.reply('Provide a number to block.');
    global.blocked = global.blocked || [];
    global.blocked.push(number);
    msg.reply(`User ${number} has been blocked.`);
  }
};
