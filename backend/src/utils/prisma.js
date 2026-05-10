const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

// Configure connection pooling via DATABASE_URL params or Prisma options
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ]
    : [
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
  datasources: {
    db: {
      url: process.env.DATABASE_URL + (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('connection_limit')
        ? (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'connection_limit=20&pool_timeout=10'
        : '')
    }
  }
});

// Log slow queries in development (only queries > 100ms)
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    if (e.duration > 100) {
      logger.debug(`Slow Query (${e.duration}ms): ${e.query}`);
    }
  });
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Prisma disconnected');
});

module.exports = prisma;
