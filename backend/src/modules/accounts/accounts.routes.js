const express = require('express');
const router = express.Router();
const chartOfAccountRoutes = require('./chart-of-accounts/chart-of-accounts.routes');

// All routes here are relative to /api/v1/accounts
router.use('/chart-of-accounts', chartOfAccountRoutes);

module.exports = router;
