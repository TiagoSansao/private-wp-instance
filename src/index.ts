import { WhatsappBot } from './entities/whatsappBot';

class Main {
  public static run() {
    const bot = new WhatsappBot();
    bot.setupListener();
    bot.login();
  }
}

Main.run();
