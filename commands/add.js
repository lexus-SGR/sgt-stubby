module.exports = {
  name: "add",
  description: "Add member to group.",
  emoji: "➕",
  async execute(sock, msg, args, metadata) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    // Hakikisha ni group
    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, { text: "This command is for groups only." });
    }

    // Hakikisha bot ni admin
    const groupMetadata = await sock.groupMetadata(from);
    const botNumber = (await sock.state.legacy.user.id.split(":")[0]) + "@s.whatsapp.net";
    const botIsAdmin = groupMetadata.participants.some(p => p.id === botNumber && p.admin);
    if (!botIsAdmin) {
      return sock.sendMessage(from, { text: "Bot must be admin to add members." });
    }

    // Hakikisha sender ni admin
    const isAdmin = groupMetadata.participants.some(p => p.id === sender && p.admin);
    if (!isAdmin) {
      return sock.sendMessage(from, { text: "Only group admins can use this command." });
    }

    // Hakikisha kuna namba
    if (!args[0]) {
      return sock.sendMessage(from, { text: "Please provide the number to add. Example: !add 255700123456" });
    }

    let number = args[0].replace(/[^0-9]/g, '');
    if (number.length < 9) {
      return sock.sendMessage(from, { text: "Invalid number format." });
    }

    const userJid = number + "@s.whatsapp.net";

    try {
      await sock.groupParticipantsUpdate(from, [userJid], "add");
      await sock.sendMessage(from, { text: `✅ Added @${number}`, mentions: [userJid] });
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ Failed to add @${number}. Maybe user blocked the group invite or privacy settings.` });
    }
  }
};
