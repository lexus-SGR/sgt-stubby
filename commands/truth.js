module.exports = {
  name: 'truth',
  description: 'Play Truth or Dare (truth question)',
  async execute(msg) {
    const truths = [
      'What is your biggest fear?',
      'Have you ever lied to your best friend?',
      'What’s your biggest secret?'
    ];
    const question = truths[Math.floor(Math.random() * truths.length)];
    msg.reply(`TRUTH: ${question}`);
  }
};
