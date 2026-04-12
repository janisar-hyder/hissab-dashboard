const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 1. Global Security Middleware
app.use(helmet()); // Sets various HTTP headers for security
app.use(cors());   // Enables Cross-Origin Resource Sharing for the Angular frontend

// 2. Logging & Parsing
app.use(morgan('dev')); // Dev-friendly request logging
app.use(express.json()); // Built-in body parser for JSON

// 3. Base Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Hissab ERP Backend',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString()
  });
});

// 4. Fallback for unhandled routes
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.statusCode = 404;
  next(error);
});

// 5. Global Error Handler (MUST be last)
app.use(errorHandler);

module.exports = app;
