module.exports = {
  name: 'guessnumber',
  description: 'Guess the number between 1-10',
  async execute(msg, args) {
    const random = Math.floor(Math.random() * 10) + 1;
    await msg.reply('I have chosen a number between 1 and 10. Can you guess it? Type your guess.');
    
    const collector = msg.createMessageCollector({ time: 10000 });
    collector.on('collect', m => {
      if (parseInt(m.body) === random) {
        msg.reply(`Correct! The number was ${random}`);
        collector.stop();
      } else {
        msg.reply('Wrong guess. Try again!');
      }
    });
  }
};
