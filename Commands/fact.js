const axios = require("axios");
module.exports = {
  name: "fact",
  execute: async (sock, msg, args, from) => {
    const res = await axios.get("https://uselessfacts.jsph.pl/random.json?language=en");
    await sock.sendMessage(from, { text: `🤯 Fact: ${res.data.text}` });
  }
};
