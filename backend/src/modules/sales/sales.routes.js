const express = require('express');
const router = express.Router();

const customersRoutes = require('./customers/customers.routes');
const quotationsRoutes = require('./quotations/quotations.routes');
const invoicesRoutes = require('./invoices/invoices.routes');

router.use('/customers', customersRoutes);
router.use('/quotations', quotationsRoutes);
router.use('/invoices', invoicesRoutes);

module.exports = router;
