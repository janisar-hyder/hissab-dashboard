const { PrismaClient } = require('@prisma/client');

/**
 * Prisma Client Instance
 * 
 * ERP BEST PRACTICE: This provides a single, high-performance 
 * connection to the database that is shared across the entire application.
 */
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;
