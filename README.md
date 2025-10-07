# WhatsApp Business API Webhook Server

A Node.js server for handling WhatsApp Business API webhooks with automatic message processing and reply functionality.

## 🚀 Features

- **Webhook Verification**: Handles WhatsApp webhook verification process
- **Message Processing**: Receives and processes various message types (text, image, video, audio, document, location, interactive)
- **Auto-Reply System**: Intelligent keyword-based automatic responses
- **Comprehensive Logging**: Console and file-based logging with daily rotation
- **Error Handling**: Detailed error messages with helpful troubleshooting steps
- **Health Monitoring**: Built-in health check endpoint
- **Easy Configuration**: Simple text-based configuration file
- **Windows Support**: Batch files for easy installation and startup

## 📋 Prerequisites

- Node.js (v14 or higher)
- WhatsApp Business API access
- Facebook Developer Account
- Valid WhatsApp Business phone number

## 🛠️ Installation

### Quick Setup (Windows)

1. **Clone or download** this project
2. **Double-click `install.bat`** to install dependencies
3. **Configure your tokens** in `config.txt`
4. **Double-click `START_SERVER.bat`** to run the server

### Manual Setup

```bash
# Install dependencies
npm install

# Configure your tokens (see Configuration section)
# Start the server
npm start
```

## ⚙️ Configuration

Edit the `config.txt` file with your WhatsApp Business API credentials:

```txt
# WhatsApp Webhook Configuration
# Just paste your tokens after the = sign (no quotes needed)

VERIFY_TOKEN=your_verify_token_here
APP_SECRET=your_app_secret_here
WHATSAPP_TOKEN=your_whatsapp_token_here
```

### Getting Your Tokens

1. **Go to [Facebook Developers Console](https://developers.facebook.com)**
2. **Navigate to your WhatsApp Business API app**
3. **Go to "WhatsApp" → "API Setup"**
4. **Copy the required tokens:**
   - **Verify Token**: Create a custom token for webhook verification
   - **App Secret**: Found in App Settings → Basic
   - **WhatsApp Token**: Generate from API Setup page

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhooks/whatsapp` | GET | Webhook verification |
| `/api/webhooks/whatsapp` | POST | Receive WhatsApp messages |
| `/health` | GET | Health check |
| `/` | GET | Server status page |

## 📱 Message Types Supported

- **Text Messages**: Full text processing with auto-reply
- **Images**: Image ID logging
- **Videos**: Video ID logging  
- **Audio**: Audio ID logging
- **Documents**: Document ID logging
- **Location**: Latitude/longitude logging
- **Interactive**: Interactive message logging

## 🤖 Auto-Reply System

The server includes intelligent auto-reply functionality:

```javascript
// Example auto-reply logic
if (userMessage.includes('hello') || userMessage.includes('hi')) {
  sendTextMessage(phoneNumberId, from, 'Hello! Thank you for contacting us. 👋');
} else if (userMessage.includes('help')) {
  sendTextMessage(phoneNumberId, from, 'How can I assist you today?');
}
```

### Customizing Auto-Replies

Edit the `handleTextMessage` function in `server.js` to add your own response logic:

```javascript
function handleTextMessage(message, phoneNumberId, from) {
  const userMessage = message.text.body.toLowerCase();
  
  // Add your custom logic here
  if (userMessage.includes('your_keyword')) {
    sendTextMessage(phoneNumberId, from, 'Your custom response');
  }
}
```

## 📊 Logging

The server provides comprehensive logging:

- **Console Output**: Real-time activity display
- **File Logging**: Daily log files in `logs/` directory
- **Error Tracking**: Detailed error messages with troubleshooting steps
- **Message Tracking**: All incoming and outgoing messages logged

### Log Files

Logs are stored in the `logs/` directory with daily rotation:
- Format: `webhook-YYYY-MM-DD.log`
- Includes timestamps, message details, and error information

## 🔧 Error Handling

The server includes intelligent error handling for common issues:

### Token Expiration
```
✗ WhatsApp Token Expired!
Your WhatsApp access token has expired. Please:
1. Go to Facebook Developers Console
2. Generate a new access token
3. Update WHATSAPP_TOKEN in config.txt
4. Restart the server
```

### Invalid Phone Number ID
```
✗ Phone Number ID Error!
The Phone Number ID in the webhook request is invalid. Please:
1. Check your WhatsApp Business API setup
2. Verify the Phone Number ID in your webhook configuration
```

### Test Webhook Handling
```
⚠ Skipping message send - Test/placeholder Phone Number ID detected
This is likely a test webhook from Facebook Developer Dashboard
```

## 🚀 Deployment

### Local Development
```bash
npm start
# Server runs on http://localhost:3000
```

### Production Deployment

1. **Use a process manager** like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name whatsapp-webhook
   ```

2. **Set up reverse proxy** (nginx/Apache) for HTTPS

3. **Configure environment variables** for production:
   ```bash
   export PORT=3000
   export NODE_ENV=production
   ```

4. **Enable signature verification** (uncomment line 126 in server.js)

## 🔒 Security

### Production Security Checklist

- [ ] Enable webhook signature verification
- [ ] Use HTTPS for webhook URL
- [ ] Store tokens in environment variables
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Use a process manager (PM2)
- [ ] Set up monitoring and alerts

### Enabling Signature Verification

Uncomment line 126 in `server.js`:
```javascript
// Change this line:
// verifyRequestSignature(req, res, JSON.stringify(req.body));

// To this:
verifyRequestSignature(req, res, JSON.stringify(req.body));
```

## 📁 Project Structure

```
whatsapp-webhook/
├── server.js              # Main server file
├── config.txt             # Configuration file
├── package.json           # Dependencies
├── install.bat            # Windows installation script
├── START_SERVER.bat       # Windows startup script
├── logs/                  # Log files directory
└── README.md              # This file
```

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid OAuth access token"**
   - Check if your WhatsApp token has expired
   - Generate a new token from Facebook Developer Console

2. **"Phone Number ID Error"**
   - Verify your phone number is properly set up
   - Check webhook configuration in Facebook Developer Console

3. **Webhook verification fails**
   - Ensure VERIFY_TOKEN matches in both config.txt and Facebook Developer Console
   - Check that your server is accessible from the internet

4. **Messages not being received**
   - Verify webhook URL is correct: `https://your-domain.com/api/webhooks/whatsapp`
   - Check server logs for errors
   - Ensure webhook is subscribed to "messages" field

### Debug Mode

Enable detailed logging by adding this to your server startup:
```bash
DEBUG=* npm start
```

## 📞 Support

For issues related to:
- **WhatsApp Business API**: Check [Facebook Developer Documentation](https://developers.facebook.com/docs/whatsapp)
- **Server Issues**: Check the logs in the `logs/` directory
- **Configuration**: Verify your tokens in `config.txt`

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Made with ❤️ for WhatsApp Business API integration**
=======
# WhatsApp-Business-API-Webhook-Server-for-Testing
>>>>>>> af3e7c9ced7957e5af087d4fe5c88ebae9d75198
