const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const authenticate = require('./middleware/auth');

const inventoryRoutes = require('./modules/inventory/inventory.routes');
const vatComplianceRoutes = require('./modules/vat-compliance/vat-compliance.routes');
const organizationRoutes = require('./modules/organization/organization.routes');
const accountRoutes = require('./modules/accounts/accounts.routes');
const purchasesRoutes = require('./modules/purchases/purchases.routes');
const salesRoutes = require('./modules/sales/sales.routes');
const contactsRoutes = require('./modules/contacts/contacts.routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// 1. Global Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP to allow Swagger UI to load assets
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));
app.use(cors());   // Enables Cross-Origin Resource Sharing for the Angular frontend
app.use(authenticate); // Centralized tenancy & user context provider

// 2. Logging & Parsing
app.use(morgan('dev')); // Dev-friendly request logging
app.use(express.json()); // Built-in body parser for JSON

// 3. Application Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/vat-compliance', vatComplianceRoutes);
app.use('/api/v1/organization', organizationRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/purchases', purchasesRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/contacts', contactsRoutes);

// Base Routes
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
