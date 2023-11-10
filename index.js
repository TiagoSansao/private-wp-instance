import fs from 'fs';
import qrcode from 'qrcode-terminal'
import wpjs from 'whatsapp-web.js'

const { Client, LocalAuth } = wpjs;

const client = new Client({authStrategy: new LocalAuth()});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', async () => {
    console.log('Session is operational!')
});

client.on('message_create', async (msg) => {
  const typeOfChat = msg.from.endsWith('@c.us') ? 'PRIVATE CHAT' :  'GROUP CHAT'
  console.log(`Received: ${msg.type} | From: ${typeOfChat} - ${msg.from} | Content: ${msg.body}`)

  if (!msg.hasMedia) return;

  const media = await msg.downloadMedia()

  const dirPath = 'vol/images/';
  const filename = `${new Date().toISOString()}.jpg`;
  const path = dirPath + filename;
  
  fs.writeFileSync(path, media.data, {encoding: 'base64'})
})

console.log('Initializing wp session...')
client.initialize();
