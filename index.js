import fs from 'fs';
import qrcode from 'qrcode-terminal'
import wpjs from 'whatsapp-web.js'

const mediaTypeMap = {
  "audio/ogg; codecs=opus": ".ogg",
  "image/jpeg": ".jpeg",
  "image/png": ".png",
  "image/gif": ".gif",
  "video/mp4": ".mp4"
}

const { Client, LocalAuth } = wpjs;

const client = new Client({
  authStrategy: new LocalAuth(), 
  puppeteer: {
    args : [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  }
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', async () => {
    console.log('Session is operational!')
});

client.on('message_create', async (msg) => {
  const isPrivateChat = msg.from.endsWith('@c.us');
  const typeOfChat = isPrivateChat ? 'PRIVATE CHAT' :  'GROUP CHAT'
  console.log(`Received: ${msg.type} | From: ${typeOfChat} - ${msg.from} | Content: ${msg.body}`)

  if (!msg.hasMedia) return;

  try {
    console.time(`Downloading ${msg.type} media`);
    const media = await msg.downloadMedia();
    const filesizeInMB = media.filesize / 1024**2;
    console.timeEnd(`Downloading ${msg.type} media`);

    if (filesizeInMB > 10 && !isPrivateChat) return; // Returns if file size weights more than 10 megabytes and is from a group

    const folder = msg.type;
    const dirPath = `vol/${folder}/`;
    let fileExtension = mediaTypeMap[media.mimetype];

    if (!fileExtension) {
      switch (msg.type) {
        case 'audio':
          fileExtension = '.ogg';
          break;
        case 'image':
          fileExtension = '.jpeg';
          break;
        case 'video':
          fileExtension = '.mp4';
          break;
        default: 
          fileExtension = '.unknown'
          break;
      }
    }

    const filename = new Date().toISOString();
    const path = dirPath + filename + fileExtension;

    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

    fs.writeFileSync(path, media.data, {encoding: 'base64'})
    console.log(`Saved ${filesizeInMB.toFixed(3)} MBs of ${msg.type}`)
  } catch (error) {
    console.log('Captured error.')
    console.error(error);
  }
})

console.log('Initializing wp session...')
client.initialize();
