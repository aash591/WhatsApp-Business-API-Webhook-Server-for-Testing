# WhatsApp Webhook Test Server

A simple Node.js server for testing WhatsApp Business API webhooks.

## Quick Start

1. **Install dependencies**: Double-click `install.bat`
2. **Add your tokens** to `config.txt`
3. **Start server**: Double-click `START_SERVER.bat`

## Configuration

Edit `config.txt` with your tokens:

```
VERIFY_TOKEN=your_verify_token_here
APP_SECRET=your_app_secret_here  
WHATSAPP_TOKEN=your_whatsapp_token_here
```

## Webhook URL

Use this URL in your Facebook Developer Console:
```
http://your-domain:3000/api/webhooks/whatsapp
```

## What it does

- ✅ Receives WhatsApp messages
- ✅ Logs everything to console and files
- ✅ Auto-replies to "hello" and "help"
- ✅ Handles test webhooks from Facebook dashboard
- ✅ Shows helpful error messages

## Files

- `server.js` - Main server code
- `config.txt` - Your tokens
- `install.bat` - Install dependencies
- `START_SERVER.bat` - Start the server
- `logs/` - Log files

That's it! Perfect for testing WhatsApp webhooks.