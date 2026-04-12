const app = require('./app');
const { pool } = require('./config/db');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Connect to Database first to ensure and then start the server
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ CRITICAL ERROR: Database connection failed at server startup!');
    console.error(`Reason: ${err.message}`);
    process.exit(1);
  }
  
  console.log('✅ Connected to PostgreSQL (hissab_db)');
  release(); // Always release the client back to the pool
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`🔗 Interface: http://localhost:${PORT}`);
  });

  // ERP Requirement: Implementation of Graceful Shutdown
  // This ensures no transactions are cut off abruptly when the server is restarted
  const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Closing HTTP server...`);
    server.close(() => {
      console.log('HTTP server closed.');
      pool.end(() => {
        console.log('Database connection pool closed.');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
});
