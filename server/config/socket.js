const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join a case room for lawyer-client chat
    socket.on('join_case', (caseId) => {
      socket.join(`case_${caseId}`);
      console.log(`📂 User joined case room: case_${caseId}`);
    });

    // Leave a case room
    socket.on('leave_case', (caseId) => {
      socket.leave(`case_${caseId}`);
      console.log(`📂 User left case room: case_${caseId}`);
    });

    // Handle real-time chat messages
    socket.on('send_message', (data) => {
      io.to(`case_${data.caseId}`).emit('receive_message', data);
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(`case_${data.caseId}`).emit('user_typing', {
        userId: data.userId,
        isTyping: data.isTyping,
      });
    });

    // JurisPilot AI mini-widget: join personal AI room
    socket.on('join_ai_room', (userId) => {
      socket.join(`ai_${userId}`);
      console.log(`🤖 User joined JurisPilot room: ai_${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized! Call initSocket first.');
  }
  return io;
};

module.exports = { initSocket, getIO };