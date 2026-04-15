const express = require('express');
const router = express.Router();

const salesPartnerRoutes = require('./sales-partners/sales-partners.routes');
const salesPersonRoutes = require('./sales-persons/sales-persons.routes');
const currencyRoutes = require('./currencies/currencies.routes');

// All routes here are relative to /api/v1/organization
router.use('/sales-partners', salesPartnerRoutes);
router.use('/sales-persons', salesPersonRoutes);
router.use('/currencies', currencyRoutes);

module.exports = router;
