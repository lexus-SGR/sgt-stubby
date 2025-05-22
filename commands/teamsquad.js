module.exports = {
  name: 'teamsquad',
  description: 'Show starting lineup for a team',
  async execute(msg, args) {
    const team = args.join(' ') || 'Manchester United';
    msg.reply(`Starting lineup for ${team}: De Gea, Maguire, Bruno, Rashford...`);
  }
};
