const express = require('express');
const router = express.Router();
const vendorContactRoutes = require('./vendor-contacts.routes');

// All routes here are relative to /api/v1/contacts
router.use('/vendor-contacts', vendorContactRoutes);

module.exports = router;
