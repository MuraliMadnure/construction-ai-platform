const app = require('./app');
const { createServer } = require('http');
const { Server } = require('socket.io');
const logger = require('./utils/logger');
const { initializeSocket } = require('./sockets');
const config = require('./config');

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: config.cors.origin,
    credentials: true
  },
  path: '/socket.io'
});

// Initialize socket handlers
initializeSocket(io);

// Make io accessible to routes
app.set('io', io);

const PORT = config.server.port;

// Start server
httpServer.listen(PORT, () => {
  logger.info(`
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║   🏗️  Construction AI Platform - Backend API            ║
    ║                                                           ║
    ║   Environment:  ${config.server.env.padEnd(38)}║
    ║   Port:         ${PORT.toString().padEnd(38)}║
    ║   API URL:      http://localhost:${PORT.toString().padEnd(24)}║
    ║   API Version:  v1                                        ║
    ║   Node:         ${process.version.padEnd(38)}║
    ║                                                           ║
    ║   Database:     Connected ✓                               ║
    ║   Redis:        Connected ✓                               ║
    ║   Socket.IO:    Active ✓                                  ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
  `);

  logger.info(`Server is running on http://localhost:${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/api/v1/health`);
  logger.info(`API Documentation: http://localhost:${PORT}/api/v1/docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  httpServer.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Process terminated!');
  });
});

module.exports = httpServer;
