const axios = require("axios");
module.exports = {
  name: "joke",
  execute: async (sock, msg, args, from) => {
    const res = await axios.get("https://v2.jokeapi.dev/joke/Any?type=single");
    await sock.sendMessage(from, { text: `😂 Joke: ${res.data.joke}` });
  }
};
