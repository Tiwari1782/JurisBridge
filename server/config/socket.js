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

    // ── Existing chat events ──
    socket.on('join_case', (caseId) => {
      socket.join(`case_${caseId}`);
      console.log(`📂 User joined case room: case_${caseId}`);
    });

    socket.on('leave_case', (caseId) => {
      socket.leave(`case_${caseId}`);
      console.log(`📂 User left case room: case_${caseId}`);
    });

    socket.on('send_message', (data) => {
      io.to(`case_${data.caseId}`).emit('receive_message', data);
    });

    socket.on('typing', (data) => {
      socket.to(`case_${data.caseId}`).emit('user_typing', {
        userId: data.userId,
        isTyping: data.isTyping,
      });
    });

    socket.on('join_ai_room', (userId) => {
      socket.join(`ai_${userId}`);
      console.log(`🤖 User joined JurisPilot room: ai_${userId}`);
    });

    // ── NEW: Video call signaling events ──

    // Join a video room
    socket.on('join_video', (caseId) => {
      socket.join(`video_${caseId}`);
      // Notify the other person in the room
      socket.to(`video_${caseId}`).emit('user_joined_video', socket.id);
      console.log(`📹 User ${socket.id} joined video room: video_${caseId}`);
    });

    // Leave video room
    socket.on('leave_video', (caseId) => {
      socket.to(`video_${caseId}`).emit('user_left_video', socket.id);
      socket.leave(`video_${caseId}`);
      console.log(`📹 User ${socket.id} left video room: video_${caseId}`);
    });

    // Relay WebRTC offer
    socket.on('video_offer', ({ caseId, offer }) => {
      socket.to(`video_${caseId}`).emit('video_offer', { offer, from: socket.id });
    });

    // Relay WebRTC answer
    socket.on('video_answer', ({ caseId, answer }) => {
      socket.to(`video_${caseId}`).emit('video_answer', { answer, from: socket.id });
    });

    // Relay ICE candidates
    socket.on('ice_candidate', ({ caseId, candidate }) => {
      socket.to(`video_${caseId}`).emit('ice_candidate', { candidate, from: socket.id });
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