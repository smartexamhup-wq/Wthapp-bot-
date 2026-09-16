const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Xiriirkii waa go'ay, dib ma u xirnaa?', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('Bot-ku si guul leh ayuu u xirxirmay!');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

        // Amarka .help
        if (text === '.help') {
            const helpMenu = `*--- MENU-KA BOT-KA ---*\n\n` +
                             `1. *.help* - Sii liiska amarrada.\n` +
                             `2. *.vv* - Soo saar fariinta View Once-ka ah.\n` +
                             `3. *.info* - Macluumaadka Bot-ka.`;
            await sock.sendMessage(from, { text: helpMenu });
        }

        // Amarka .info
        if (text === '.info') {
            const infoText = `*--- MACLUUMADKA BOT-KA ---*\n\n` +
                             `*Magaca:* Somali WhatsApp Bot\n` +
                             `*Version:* 1.0.0\n` +
                             `*Xaaladda:* Active (On)`;
            await sock.sendMessage(from, { text: infoText });
        }

        // Amarka .vv (View Once)
        if (text === '.vv') {
            await sock.sendMessage(from, { text: "Fadlan reply ku samee fariinta View Once-ka ah adigoo adeegsanaya .vv" });
        }
    });
}

startBot();
