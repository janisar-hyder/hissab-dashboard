const express = require('express');
const router = express.Router();
const { getVatSettings, updateVatSettings } = require('./vat-settings.controller');

/**
 * @swagger
 * tags:
 *   name: VAT Settings
 *   description: VAT Configuration and Registration management
 */

/**
 * @swagger
 * /api/v1/vat-compliance/settings:
 *   get:
 *     summary: Retrieve current VAT settings
 *     tags: [VAT Settings]
 *     responses:
 *       200:
 *         description: Successfully retrieved VAT settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     client_id:
 *                       type: integer
 *                     is_vat_registered:
 *                       type: boolean
 *                     tax_registration_number:
 *                       type: string
 *                     vat_registered_on:
 *                       type: string
 *                       format: date
 */
router.get('/', getVatSettings);

/**
 * @swagger
 * /api/v1/vat-compliance/settings:
 *   patch:
 *     summary: Update VAT settings
 *     tags: [VAT Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_vat_registered:
 *                 type: boolean
 *               tax_registration_number:
 *                 type: string
 *               vat_registered_on:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: VAT settings updated successfully
 */
router.patch('/', updateVatSettings);

module.exports = router;
