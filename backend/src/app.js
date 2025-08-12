const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const webhookRoute = require('./routes/webhook');
const apiRoute = require('./routes/api');

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Cleaner request logging - only show important requests
app.use((req, res, next) => {
  // Skip logging for CORS preflight and health checks
  if (req.method === 'OPTIONS' || req.path === '/' || req.path === '/test') {
    return next();
  }
  
  // Only log actual API calls and webhooks
  if (req.path.startsWith('/api/') || req.path.startsWith('/webhook/')) {
    console.log(`📡 ${req.method} ${req.path} - ${req.headers.origin || 'no origin'}`);
  }
  
  next();
});

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',  // Vite dev server
      'http://localhost:3000',  // Alternative dev port
      'http://127.0.0.1:5173', // Alternative localhost
      'http://127.0.0.1:3000'  // Alternative localhost
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Pre-flight requests
app.options('*', cors());

app.use('/webhook', webhookRoute);
app.use('/api', apiRoute);

// health
app.get('/', (req, res) => res.send({ ok: true }));

// test endpoint for debugging
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString(),
    cors: process.env.CORS_ORIGIN || 'configured',
    origin: req.headers.origin || 'no origin'
  });
});

// Simple test endpoint for status progression (for debugging)
app.post('/test/status-progression', async (req, res) => {
  try {
    const Message = require('./models/Message');
    
    // Find outbound messages with 'sent' status
    const messages = await Message.find({ direction: 'outbound', status: 'sent' }).limit(3);
    
    if (messages.length === 0) {
      return res.json({ message: 'No outbound messages found to update' });
    }
    
    // Update first message to 'delivered'
    if (messages[0]) {
      await Message.findByIdAndUpdate(messages[0]._id, { status: 'delivered' });
    }
    
    // Update second message to 'read' if exists
    if (messages[1]) {
      await Message.findByIdAndUpdate(messages[1]._id, { status: 'read' });
    }
    
    res.json({ 
      message: 'Status progression test completed',
      updated: messages.length,
      details: messages.map(m => ({ id: m._id, status: m.status }))
    });
    
  } catch (error) {
    console.error('Status progression test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to show loaded routes
app.get('/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          routes.push({
            path: `/api${handler.route.path}`,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.json({
    message: 'Loaded routes',
    routes: routes
  });
});

module.exports = app;
