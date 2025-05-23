AI command: askai module.exports = { name: "askai", description: "Ask any question to the AI (OpenAI powered)", emoji: "🧐", async execute(sock, msg, args, openai) { await sock.sendMessage(msg.key.remoteJid, { react: { text: "🧐", key: msg.key } });

if (!args || args.length === 0) {
  return await sock.sendMessage(msg.key.remoteJid, {
    text: "Please provide a question. Example: *askai What is quantum computing?*"
  });
}

try {
  const prompt = args.join(" ");
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }]
  });

  const reply = response.data.choices[0].message.content;
  await sock.sendMessage(msg.key.remoteJid, { text: `🧐 *AI Response:*

${reply}` });

} catch (err) {
  console.error("AI error:", err);
  await sock.sendMessage(msg.key.remoteJid, { text: "❌ Failed to get AI response. Try again later." });
}

} };


