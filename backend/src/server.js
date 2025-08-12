require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const { Server } = require('socket.io');
const { initSocket } = require('./utils/socket');

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp';

async function start() {
  await mongoose.connect(MONGODB_URI, {});

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN || '*' }
  });
  initSocket(io);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server listening on ${PORT}`);
  });
  
}

start().catch(err => {
  console.error('Failed to start', err);
  process.exit(1);
});
