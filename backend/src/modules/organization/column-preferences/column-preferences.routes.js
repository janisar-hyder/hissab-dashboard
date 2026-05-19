const express = require('express');
const router = express.Router();
const {
  getPreferences,
  savePreferences,
  deletePreferences,
} = require('./column-preferences.controller');

// GET  /api/v1/organization/column-preferences/:pageId
router.get('/:pageId', getPreferences);

// PUT  /api/v1/organization/column-preferences/:pageId
router.put('/:pageId', savePreferences);

// DELETE /api/v1/organization/column-preferences/:pageId
router.delete('/:pageId', deletePreferences);

module.exports = router;
