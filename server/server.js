require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = Number(process.env.PORT) || 5001;
const HOST = '0.0.0.0';

// Configure Production CORS
const getAllowedOrigins = () => {
  const clientUrl = process.env.CLIENT_URL;
  if (clientUrl) {
    return clientUrl.split(',').map((url) => url.trim().replace(/\/+$/, ''));
  }
  return [];
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, curl, Postman, health checks with no origin header
      if (!origin) return callback(null, true);

      const allowedList = getAllowedOrigins();

      // Allow local development ports
      if (
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }

      // Allow configured CLIENT_URL
      if (allowedList.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel deployment and preview URLs (*.vercel.app)
      try {
        const hostname = new URL(origin).hostname;
        if (hostname.endsWith('.vercel.app')) {
          return callback(null, true);
        }
      } catch (e) {}

      // In non-production, be permissive
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '2mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1
      ? 'connected'
      : dbState === 2
      ? 'connecting'
      : 'disconnected';

  res.status(200).json({
    status: 'ok',
    message: 'Personal Finance Tracker API is running',
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

// Connect DB and Start Server
const startServer = () => {
  const server = app.listen(PORT, HOST, () => {
    console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on http://${HOST}:${PORT}`);
    console.log(`[Server] Health check at http://${HOST}:${PORT}/api/health`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      if (process.env.NODE_ENV === 'production') {
        console.error(`[Server] Port ${PORT} already in use. Exiting for container orchestrator.`);
        process.exit(1);
      }
      const nextPort = PORT + 1;
      console.warn(`[Server] Port ${PORT} is busy, retrying on port ${nextPort}`);
      app.listen(nextPort, HOST);
      return;
    }
    console.error(`[Server] Fatal error: ${error.message}`);
    process.exit(1);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`[Server] Received ${signal}. Gracefully closing HTTP server and DB connection...`);
    server.close(async () => {
      await mongoose.connection.close(false);
      console.log('[Server] Process terminated cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

connectDB()
  .then(() => {
    startServer();
  })
  .catch((err) => {
    console.error(`[Server] Failed to connect to DB: ${err.message}`);
    process.exit(1);
  });

process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
