const express = require('express');
const router = express.Router();

const vatRateRoutes = require('./vat-rates/vat-rates.routes');

// All routes here are relative to /api/v1/vat-compliance
router.use('/', vatRateRoutes);

module.exports = router;
