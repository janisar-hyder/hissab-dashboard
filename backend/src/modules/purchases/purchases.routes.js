const express = require('express');
const router = express.Router();
const vendorRoutes = require('./vendors/vendors.routes');

// All routes here are relative to /api/v1/purchases
router.use('/vendors', vendorRoutes);

module.exports = router;
