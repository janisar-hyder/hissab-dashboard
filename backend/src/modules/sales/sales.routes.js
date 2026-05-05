const express = require('express');
const router = express.Router();

const customersRoutes = require('./customers/customers.routes');
const quotationsRoutes = require('./quotations/quotations.routes');
const invoicesRoutes = require('./invoices/invoices.routes');
const recurringInvoicesRoutes = require('./recurring-invoices/recurring-invoices.routes');
const deliveryNotesRoutes = require('./delivery-notes/delivery-notes.routes');
const receiptsRoutes = require('./receipts/receipts.routes');
const creditNotesRoutes = require('./credit-notes/credit-notes.routes');

router.use('/customers', customersRoutes);
router.use('/quotations', quotationsRoutes);
router.use('/invoices', invoicesRoutes);
router.use('/recurring-invoices', recurringInvoicesRoutes);
router.use('/delivery-notes', deliveryNotesRoutes);
router.use('/receipts', receiptsRoutes);
router.use('/credit-notes', creditNotesRoutes);

module.exports = router;
