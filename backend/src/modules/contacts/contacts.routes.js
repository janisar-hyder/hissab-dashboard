const express = require('express');
const router = express.Router();
const vendorContactRoutes = require('./vendor-contacts.routes');
const customerContactRoutes = require('./customer-contacts.routes');

// All routes here are relative to /api/v1/contacts
router.use('/vendor-contacts', vendorContactRoutes);
router.use('/customer-contacts', customerContactRoutes);

module.exports = router;
