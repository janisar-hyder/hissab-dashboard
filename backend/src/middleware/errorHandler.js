const errorHandler = (err, req, res, next) => {
  // Enhanced logging for ERP debugging
  console.error(`[ERROR] ${req.method} ${req.url}: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message || 'Internal Server Error',
    // Only expose stack traces in dev mode to prevent leaking server details
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
