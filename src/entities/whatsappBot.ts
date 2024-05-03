import fs from 'fs';
import qrcode from 'qrcode-terminal';
import { Client, LocalAuth } from 'whatsapp-web.js';

type MediaType = { [key: string]: string };

const mediaTypeMap: MediaType = {
  'audio/ogg; codecs=opus': '.ogg',
  'image/jpeg': '.jpeg',
  'image/png': '.png',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
};

export class WhatsappBot {
  private readonly client: Client;

  constructor() {
    console.log('Initializing WhatsappBot.');

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: './vol/sessions/',
      }),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
      webVersionCache: {
        type: 'remote',
        remotePath:
          'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2409.0.html',
      },
    });

    this.client.initialize();
  }

  public async login(): Promise<void> {
    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('Connected to Whatsapp Web.');
      return;
    });
  }

  public async setupListener() {
    this.client.on('message_create', async (msg) => {
      const isPrivateChat = msg.from.endsWith('@c.us');
      const typeOfChat = isPrivateChat ? 'PRIVATE CHAT' : 'GROUP CHAT';
      console.log(
        `Received: ${msg.type} | From: ${typeOfChat} - ${msg.from} | Content: ${msg.body}`
      );

      if (!msg.hasMedia) return;

      try {
        const media = await msg.downloadMedia();
        const filesizeInMB = (media.filesize || 0) / 1024 ** 2;

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
              fileExtension = '.unknown';
              break;
          }
        }

        const filename = new Date().toISOString();
        const path = dirPath + filename + fileExtension;

        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

        fs.writeFileSync(path, media.data, { encoding: 'base64' });
        console.log(`Saved ${filesizeInMB.toFixed(3)} MBs of ${msg.type}`);
      } catch (error) {
        console.log('Captured error.');
        console.error(error);
      }
    });

    console.log('Loaded bot event listener.');
  }
}
