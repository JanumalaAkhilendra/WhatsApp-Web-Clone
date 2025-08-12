let ioRef = null;

function initSocket(io) {
  ioRef = io;
  global.io = io; // Set global reference for compatibility
  
  io.on('connection', socket => {
    console.log('Socket connected:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
}

function emitNewMessage(msg) {
  if (!ioRef) {
    console.log('Socket not initialized, skipping emit');
    return;
  }
  
  try {
    ioRef.emit('message_updated', msg);
    console.log('Emitted message update via socket:', msg._id);
  } catch (err) {
    console.error('Error emitting message:', err);
  }
}

module.exports = { initSocket, emitNewMessage };
