module.exports = {
  name: 'sportquote',
  description: 'Send an inspirational sports quote',
  async execute(msg) {
    const quotes = [
      "Winners never quit and quitters never win.",
      "You miss 100% of the shots you don’t take.",
      "Hard work beats talent when talent doesn't work hard."
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    msg.reply(quote);
  }
};
