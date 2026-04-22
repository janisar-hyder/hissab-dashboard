const express = require('express');
const router = express.Router();

const customersRoutes = require('./customers/customers.routes');

router.use('/customers', customersRoutes);

module.exports = router;
