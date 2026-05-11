const express = require('express');
const router = express.Router();
const salesSettingsController = require('./sales-settings.controller');

router.get('/:module', salesSettingsController.getSettings);
router.put('/:module', salesSettingsController.updateSettings);

module.exports = router;
