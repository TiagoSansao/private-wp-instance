import fs from fs;
import qrcode from 'qrcode-terminal'

const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client({authStrategy: new LocalAuth()});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', async () => {
    console.log('Session is operational!')

    // const chat = await client.getChatById('554788303706@c.us')
    // console.log(chat)
    // const messages = await chat.fetchMessages();
    // console.log(messages);
    // const x = await messages[0].downloadMedia()
    // console.log(x)
    // fs.writeFileSync(`${Math.random().toString()}.jpg`, x.data, {encoding: 'base64'})
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

client.initialize();
