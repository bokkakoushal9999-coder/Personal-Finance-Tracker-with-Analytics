require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 5001;

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`[Server] Running on http://localhost:${port}`);
    console.log(`[Server] API available at http://localhost:${port}/api`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      if (nextPort > 65535) {
        throw error;
      }

      console.warn(`[Server] Port ${port} is busy, retrying on http://localhost:${nextPort}`);
      startServer(nextPort);
      return;
    }

    throw error;
  });
};

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Personal Finance Tracker API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => {
    startServer(DEFAULT_PORT);
  })
  .catch((err) => {
    console.error(`[Server] Failed to connect to DB: ${err.message}`);
    process.exit(1);
  });

process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
