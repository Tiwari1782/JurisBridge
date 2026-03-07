const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const rateLimit = require('express-rate-limit');

// Load env vars
dotenv.config();

// Import configs
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { errorHandler } = require('./middleware/errorHandler');
const { initProviders } = require('./services/aiService');
const paymentRoutes = require('./routes/paymentRoutes');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect to MongoDB
connectDB();

// Initialize AI Providers (JurisPilot)
console.log('\n🤖 Initializing JurisPilot AI Providers...');
initProviders();

// ---------------------
// GLOBAL MIDDLEWARES
// ---------------------

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});
app.use('/api', limiter);

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: '🤖 JurisPilot rate limit reached. Please wait before asking more questions.',
  },
});
app.use('/api/ai', aiLimiter);

// ---------------------
// ROUTES
// ---------------------

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🔨 JurisBridge API is running!',
    assistant: '🤖 JurisPilot AI is ready.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ✅ Auth Routes
app.use('/api/auth', require('./routes/authRoutes'));

// ✅ AI Routes (JurisPilot)
app.use('/api/ai', require('./routes/aiRoutes'));

// ✅ Lawyer Marketplace Routes
app.use('/api/lawyers', require('./routes/lawyerRoutes'));

// ✅ Case Management Routes
app.use('/api/cases', require('./routes/caseRoutes'));

// ✅ Chat Routes
app.use('/api/chat', require('./routes/chatRoutes'));

// ✅ Document Analysis Routes
app.use('/api/documents', require('./routes/documentRoutes'));

// ✅ Legal Notice Routes
app.use('/api/notices', require('./routes/noticeRoutes'));

// ✅ Evidence Management Routes
app.use('/api/evidence', require('./routes/evidenceRoutes'));

// ✅ TTS Voice Routes
app.use('/api/tts', require('./routes/ttsRoutes'));

// ✅ Dashboard Stats Routes
app.use('/api/stats', require('./routes/statsRoutes'));

// Payment
app.use('/api/payments', paymentRoutes);
// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Global error handler
app.use(errorHandler);

// ---------------------
// START SERVER
// ---------------------
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('='.repeat(50));
  console.log(`🔨  JurisBridge Server — FULL BACKEND READY`);
  console.log(`🤖  JurisPilot AI Assistant`);
  console.log(`🚀  Running on port ${PORT}`);
  console.log(`🌍  Environment: ${process.env.NODE_ENV}`);
  console.log(`📡  Socket.io: Ready`);
  console.log(`📂  All Routes: Active`);
  console.log('='.repeat(50));
  console.log('');
});

module.exports = { app, server };