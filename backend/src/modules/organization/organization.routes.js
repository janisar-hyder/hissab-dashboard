const express = require('express');
const router = express.Router();

const salesPartnerRoutes = require('./sales-partners/sales-partners.routes');

// All routes here are relative to /api/v1/organization
router.use('/sales-partners', salesPartnerRoutes);

module.exports = router;
