// server.js - WhatsApp Business Webhook Server
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Load configuration from config.txt (simpler format)
let config = {
  VERIFY_TOKEN: 'your_verify_token_here',
  APP_SECRET: 'your_app_secret_here',
  WHATSAPP_TOKEN: 'your_whatsapp_token_here'
};

const configPath = path.join(__dirname, 'config.txt');
if (fs.existsSync(configPath)) {
  try {
    const configFile = fs.readFileSync(configPath, 'utf8');
    const lines = configFile.split('\n');
    
    lines.forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        const cleanKey = key.trim();
        if (cleanKey && value) {
          config[cleanKey] = value;
        }
      }
    });
    
    console.log('✓ Configuration loaded from config.txt');
  } catch (error) {
    console.log('⚠ Error reading config.txt, using defaults');
  }
} else {
  // Create default config file
  const defaultConfig = `# WhatsApp Webhook Configuration
# Just paste your tokens after the = sign (no quotes needed)

VERIFY_TOKEN=your_verify_token_here
APP_SECRET=your_app_secret_here
WHATSAPP_TOKEN=your_whatsapp_token_here
`;
  fs.writeFileSync(configPath, defaultConfig);
  console.log('✓ Created config.txt - Please update with your tokens');
}

// Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Logger function
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  console.log(logMessage);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
  
  // Write to log file
  const logFile = path.join(logsDir, `webhook-${new Date().toISOString().split('T')[0]}.log`);
  const logEntry = data ? `${logMessage}\n${JSON.stringify(data, null, 2)}\n` : `${logMessage}\n`;
  fs.appendFileSync(logFile, logEntry);
}

// Verify webhook signature
function verifyRequestSignature(req, res, buf) {
  const signature = req.headers['x-hub-signature-256'];
  
  if (!signature) {
    log('⚠ No signature found in request headers');
    return;
  }

  const elements = signature.split('=');
  const signatureHash = elements[1];
  const expectedHash = crypto
    .createHmac('sha256', config.APP_SECRET)
    .update(buf)
    .digest('hex');

  if (signatureHash !== expectedHash) {
    throw new Error('Invalid signature');
  }
}

// GET endpoint for webhook verification
app.get('/api/webhooks/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  log('Webhook verification request received', { mode, token });

  if (mode && token) {
    if (mode === 'subscribe' && token === config.VERIFY_TOKEN) {
      log('✓ Webhook verified successfully!');
      res.status(200).send(challenge);
    } else {
      log('✗ Verification failed. Token mismatch.');
      res.sendStatus(403);
    }
  } else {
    log('✗ Missing mode or token parameters');
    res.sendStatus(400);
  }
});

// POST endpoint for receiving webhook events
app.post('/api/webhooks/whatsapp', (req, res) => {
  try {
    // Verify signature (uncomment in production)
    // verifyRequestSignature(req, res, JSON.stringify(req.body));

    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      body.entry.forEach(entry => {
        const changes = entry.changes;
        
        changes.forEach(change => {
          if (change.field === 'messages') {
            const value = change.value;
            
            // Handle messages
            if (value.messages) {
              value.messages.forEach(message => {
                log('📨 Received message', {
                  from: message.from,
                  type: message.type,
                  timestamp: message.timestamp,
                  id: message.id
                });
                
                handleMessage(message, value.metadata);
              });
            }
            
            // Handle status updates
            if (value.statuses) {
              value.statuses.forEach(status => {
                log('📊 Status update', {
                  id: status.id,
                  status: status.status,
                  timestamp: status.timestamp
                });
                
                handleStatus(status);
              });
            }
          }
        });
      });

      res.sendStatus(200);
    } else {
      log('Received non-WhatsApp event');
      res.sendStatus(404);
    }
  } catch (error) {
    log('✗ Error processing webhook', { error: error.message });
    res.sendStatus(500);
  }
});

// Handle incoming messages
function handleMessage(message, metadata) {
  const phoneNumberId = metadata.phone_number_id;
  const from = message.from;
  
  switch (message.type) {
    case 'text':
      log(`💬 Text: ${message.text.body}`);
      handleTextMessage(message, phoneNumberId, from);
      break;
      
    case 'image':
      log(`🖼 Image ID: ${message.image.id}`);
      break;
      
    case 'video':
      log(`🎥 Video ID: ${message.video.id}`);
      break;
      
    case 'audio':
      log(`🎵 Audio ID: ${message.audio.id}`);
      break;
      
    case 'document':
      log(`📄 Document ID: ${message.document.id}`);
      break;
      
    case 'location':
      log(`📍 Location: ${message.location.latitude}, ${message.location.longitude}`);
      break;
      
    case 'interactive':
      log(`🔘 Interactive: ${message.interactive.type}`);
      break;
      
    default:
      log(`❓ Unsupported type: ${message.type}`);
  }
}

// Handle message status updates
function handleStatus(status) {
  switch (status.status) {
    case 'delivered':
      log(`✓ Message ${status.id} delivered`);
      break;
    case 'read':
      log(`✓✓ Message ${status.id} read`);
      break;
    case 'failed':
      log(`✗ Message ${status.id} failed`);
      if (status.errors) {
        log('Error details', status.errors);
      }
      break;
  }
}

// Handle text messages and send auto-reply
function handleTextMessage(message, phoneNumberId, from) {
  const userMessage = message.text.body.toLowerCase();
  
  // Example auto-reply logic
  if (userMessage.includes('hello') || userMessage.includes('hi')) {
    sendTextMessage(phoneNumberId, from, 'Hello! Thank you for contacting us. 👋');
  } else if (userMessage.includes('help')) {
    sendTextMessage(phoneNumberId, from, 'How can I assist you today?');
  }
}

// Send text message via WhatsApp Business API
async function sendTextMessage(phoneNumberId, to, messageText) {
  try {
    // Skip sending for test/placeholder phone number IDs
    if (phoneNumberId === '123456123' || phoneNumberId === '123456789') {
      log('⚠ Skipping message send - Test/placeholder Phone Number ID detected', {
        phoneNumberId,
        message: 'This is likely a test webhook from Facebook Developer Dashboard',
        note: 'Real webhooks will use your actual Phone Number ID'
      });
      return { test: true, message: 'Test webhook - message not sent' };
    }
    
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: messageText
        }
      })
    });
    
    const data = await response.json();
    
    // Check for specific OAuth errors and provide helpful guidance
    if (data.error) {
      if (data.error.code === 190) {
        if (data.error.error_subcode === 463 || data.error.message.includes('Session has expired')) {
          log('✗ WhatsApp Token Expired!', {
            error: data.error.message,
            help: 'Your WhatsApp access token has expired. Please:',
            steps: [
              '1. Go to Facebook Developers Console (developers.facebook.com)',
              '2. Navigate to your WhatsApp Business API app',
              '3. Go to "WhatsApp" → "API Setup"',
              '4. Generate a new access token',
              '5. Update WHATSAPP_TOKEN in config.txt',
              '6. Restart the server'
            ]
          });
        } else if (data.error.message.includes('Invalid OAuth access token')) {
          log('✗ Invalid WhatsApp Token!', {
            error: data.error.message,
            help: 'Your WhatsApp access token is invalid. Please:',
            steps: [
              '1. Check if the token in config.txt is correct',
              '2. Generate a new token from Facebook Developers Console',
              '3. Make sure there are no extra spaces or characters',
              '4. Update WHATSAPP_TOKEN in config.txt',
              '5. Restart the server'
            ]
          });
        } else {
          log('✗ WhatsApp API Error', data);
        }
      } else if (data.error.code === 100 && data.error.error_subcode === 33) {
        log('✗ Phone Number ID Error!', {
          error: data.error.message,
          help: 'The Phone Number ID in the webhook request is invalid. Please:',
          steps: [
            '1. Check your WhatsApp Business API setup',
            '2. Verify the Phone Number ID in your webhook configuration',
            '3. Make sure the phone number is properly verified',
            '4. Check if you have the correct permissions for this phone number',
            '5. Go to Facebook Developers Console → WhatsApp → API Setup',
            '6. Verify your phone number and get the correct Phone Number ID'
          ],
          note: 'The Phone Number ID should be a long numeric string, not "123456123"'
        });
      } else {
        log('✗ WhatsApp API Error', data);
      }
    } else {
      log('✓ Message sent', data);
    }
    
    return data;
  } catch (error) {
    log('✗ Error sending message', { error: error.message });
    throw error;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>WhatsApp Webhook Server</title></head>
      <body style="font-family: Arial; padding: 40px; background: #f5f5f5;">
        <h1>✅ WhatsApp Webhook Server is Running</h1>
        <p><strong>Status:</strong> Active</p>
        <p><strong>Port:</strong> ${PORT}</p>
        <p><strong>Uptime:</strong> ${Math.floor(process.uptime())} seconds</p>
        <hr>
        <h3>Endpoints:</h3>
        <ul>
          <li><code>GET /api/webhooks/whatsapp</code> - Webhook verification</li>
          <li><code>POST /api/webhooks/whatsapp</code> - Receive messages</li>
          <li><code>GET /health</code> - Health check</li>
        </ul>
        <p style="color: #666; margin-top: 30px;">
          Check the console window and logs folder for activity.
        </p>
      </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.clear();
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   WhatsApp Business Webhook Server            ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✓ Server started successfully!`);
  console.log(`✓ Running on: http://localhost:${PORT}`);
  console.log(`✓ Webhook endpoint: http://localhost:${PORT}/api/webhooks/whatsapp`);
  console.log('');
  console.log('Configuration:');
  console.log(`  - Verify Token: ${config.VERIFY_TOKEN}`);
  console.log(`  - Logs: ./logs/ folder`);
  console.log('');
  console.log('📝 Waiting for webhook events...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});

// Handle server errors
process.on('uncaughtException', (error) => {
  log('✗ Uncaught Exception', { error: error.message, stack: error.stack });
});

process.on('unhandledRejection', (reason, promise) => {
  log('✗ Unhandled Rejection', { reason, promise });
});

module.exports = app;