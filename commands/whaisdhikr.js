module.exports = {
  name: "whatisdhikr",
  description: "Explains the importance of remembering Allah",
  emoji: "🧠",
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: "🧠", key: msg.key }
    });

    const message = `🧠 *What is Dhikr?*\n
Dhikr means the remembrance of Allah through words and actions. It brings peace to the heart and strengthens faith.

Common forms of Dhikr:
- SubhanAllah (Glory be to Allah)
- Alhamdulillah (All praise is for Allah)
- Allahu Akbar (Allah is the Greatest)
- La ilaha illa Allah (There is no god but Allah)

Allah says in the Quran: *"Verily, in the remembrance of Allah do hearts find rest."* (Surah Ar-Ra’d 13:28)`;

    await sock.sendMessage(msg.key.remoteJid, { text: message });
  }
};
