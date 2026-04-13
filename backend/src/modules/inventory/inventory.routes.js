const express = require('express');
const router = express.Router();

const categoryRoutes = require('./categories/categories.routes');
const subCategoryRoutes = require('./sub-categories/sub-categories.routes');
const unitRoutes = require('./unit-of-measures/units.routes');

// All routes here are relative to /api/v1/inventory
router.use('/', categoryRoutes);
router.use('/', subCategoryRoutes);
router.use('/', unitRoutes);

module.exports = router;
