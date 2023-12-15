# private-wp-instance

As the name says, this is my private whatsapp manager. So, its purpose is basically meet any need I might have related to WhatsApp. Be it automatically answering or triggering any other function when I receive a specific pattern of whatsapp messages, idk. It's very broad and may change over time.

Status:

- Stable, has ben running for some weeks.

Current state:

- Vanilla Javascript.
- No Docker, I'm using pm2 daemon to let the app running on a DigitalOcean machine.
- All data downloaded is stored in a mapped volume `vol/` according to its mimetype, ex.: `vol/images/`.

Current bugs:

- If massive amount of data (videos, photos...) is received, the application stops working without any error.
