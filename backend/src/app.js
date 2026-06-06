require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIO = require('socket.io');
require('express-async-errors');

// Import routes
const authRoutes = require('./routes/auth');
const lapanganRoutes = require('./routes/lapangan');
const transaksiRoutes = require('./routes/transaksi');
const hargaRoutes = require('./routes/harga');
const kasirRoutes = require('./routes/kasir');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');

// Import socket config
const socketConfig = require('./config/socket');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }
});

// ============================================
// Middleware
// ============================================

app.use(helmet());
app.use(compression());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Terlalu banyak request dari IP ini, silakan coba beberapa saat lagi'
});
app.use(limiter);

app.use(express.json({ limit: process.env.MAX_FILE_SIZE || '5mb' }));
app.use(express.urlencoded({ limit: process.env.MAX_FILE_SIZE || '5mb', extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================
// Routes
// ============================================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Backend is running',
    timestamp: new Date()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/lapangan', authenticate, lapanganRoutes);
app.use('/api/transaksi', authenticate, transaksiRoutes);
app.use('/api/harga', authenticate, hargaRoutes);
app.use('/api/kasir', authenticate, kasirRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route tidak ditemukan',
    path: req.path
  });
});

app.use(errorHandler);

// ============================================
// Socket.io Configuration
// ============================================

socketConfig(io);

// ============================================
// Server Start
// ============================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🚀 ShuttleSync Backend Server Running`);
  console.log(`📄 Port: ${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`${'='.repeat(50)}\n`);
});

process.on('SIGTERM', () => {
  console.log('\n🛳 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('🛳 HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
