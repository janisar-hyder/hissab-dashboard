const express = require('express');
const router = express.Router();

const vatRateRoutes = require('./vat-rates/vat-rates.routes');
const vatSettingsRoutes = require('./vat-settings/vat-settings.routes');

// All routes here are relative to /api/v1/vat-compliance
router.use('/', vatRateRoutes);
router.use('/settings', vatSettingsRoutes);

module.exports = router;
