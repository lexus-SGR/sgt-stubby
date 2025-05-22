module.exports = {
  name: 'truth',
  description: 'Play Truth or Dare (truth question)',

  async execute(sock, msg, args, from) {
    const truths = [
      'What is your biggest fear?',
      'Have you ever lied to your best friend?',
      'What’s your biggest secret?',
      'Have you ever had a crush on someone in this group?',
      'Have you ever stolen something?',
      'What’s the most embarrassing thing you’ve done?',
      'Who was your first kiss?',
      'Have you ever faked being sick to skip school?',
      'What’s the last lie you told?',
      'Who do you secretly admire here?',
      'What’s your guilty pleasure?',
      'If you had to date someone here, who would it be?',
    ];

    const question = truths[Math.floor(Math.random() * truths.length)];

    await sock.sendMessage(from, {
      text: `🗣️ *TRUTH*: ${question}`,
      quoted: msg,
    });
  }
};
