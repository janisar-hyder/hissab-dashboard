const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hissab ERP API Documentation',
      version: '1.0.0',
      description: 'Interactive API documentation for the Hissab ERP system. This dashboard allows you to view and test all available endpoints.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        // We will eventually add JWT here, but for now we rely on the manual middleware
        // which currently has hardcoded IDs for testing.
      },
    },
  },
  // Path to the API docs (where we will add JSDoc comments)
  apis: [
    './src/modules/inventory/*/*.routes.js',
    './src/modules/vat-compliance/*/*.routes.js',
    './src/modules/organization/*/*.routes.js',
    './src/modules/accounts/*/*.routes.js',
    './src/modules/purchases/*/*.routes.js',
    './src/modules/sales/*/*.routes.js',
    './src/modules/contacts/*.routes.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
