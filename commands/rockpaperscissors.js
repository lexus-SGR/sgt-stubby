module.exports = {
  name: 'rps',
  description: 'Rock Paper Scissors game',
  async execute(msg, args) {
    const choices = ['rock', 'paper', 'scissors'];
    const user = args[0]?.toLowerCase();
    const bot = choices[Math.floor(Math.random() * 3)];

    if (!choices.includes(user)) {
      return msg.reply('Choose one: rock, paper, or scissors');
    }

    let result = '';
    if (user === bot) result = "It's a tie!";
    else if ((user === 'rock' && bot === 'scissors') || (user === 'scissors' && bot === 'paper') || (user === 'paper' && bot === 'rock')) result = 'You win!';
    else result = 'You lose!';

    msg.reply(`Bot chose *${bot}*. ${result}`);
  }
};
