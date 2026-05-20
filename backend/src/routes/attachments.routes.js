const express = require('express');
const router = express.Router();
const attachmentsController = require('../controllers/attachments.controller');

// Upload a single or multiple files
router.post('/upload', attachmentsController.uploadAttachments);

// Delete an attachment
router.delete('/remove', attachmentsController.removeAttachment);

module.exports = router;
