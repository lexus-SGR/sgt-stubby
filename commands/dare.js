module.exports = {
  name: 'dare',
  description: 'Play Truth or Dare (dare)',
  async execute(msg) {
    const dares = [
      'Send a voice note singing a song',
      'Change your status to "I love the bot!" for 1 hour',
      'Send a funny meme'
    ];
    const dare = dares[Math.floor(Math.random() * dares.length)];
    msg.reply(`DARE: ${dare}`);
  }
};
