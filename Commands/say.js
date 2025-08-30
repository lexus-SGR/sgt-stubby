module.exports = {
    name: "say",
    execute: async (sock, msg, args, from, sender, isGroup, AUTO_REACT_EMOJI) => {
        try {
            if(args.length === 0) return await sock.sendMessage(from, { text: "❌ Usage: !say your message here" });

            const message = args.join(" ");
            await sock.sendMessage(from, { text: `🗣️ You said: "${message}"` });

            if (AUTO_REACT_EMOJI) {
                await sock.sendMessage(from, { react: { text: AUTO_REACT_EMOJI, key: msg.key } });
            }

        } catch (e) {
            console.error("❌ Say command error:", e);
            await sock.sendMessage(from, { text: "❌ Error echoing your message!" });
        }
    }
};
