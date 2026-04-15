const express = require('express');
const router = express.Router();
const { 
  getVatRates, 
  createVatRate, 
  updateVatRate, 
  deleteVatRates,
  updateBulkStatus
} = require('./vat-rates.controller');

/**
 * @swagger
 * tags:
 *   name: VAT Rates
 *   description: VAT Rate management APIs under VAT & Compliance
 */

/**
 * @swagger
 * /api/v1/vat-compliance/vat-rates:
 *   get:
 *     summary: Retrieve a list of all VAT rates
 *     tags: [VAT Rates]
 *     responses:
 *       200:
 *         description: A successfully retrieved list of VAT rates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       rate:
 *                         type: number
 *                       status:
 *                         type: string
 */
router.get('/vat-rates', getVatRates);

/**
 * @swagger
 * /api/v1/vat-compliance/vat-rates:
 *   post:
 *     summary: Create a new VAT rate
 *     tags: [VAT Rates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - rate
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Standard Rate"
 *               rate:
 *                 type: number
 *                 example: 5.00
 *               status:
 *                 type: string
 *                 example: "Active"
 *     responses:
 *       201:
 *         description: VAT rate created successfully
 */
router.post('/vat-rates', createVatRate);

/**
 * @swagger
 * /api/v1/vat-compliance/vat-rates/bulk-status:
 *   patch:
 *     summary: Update status for multiple VAT rates
 *     tags: [VAT Rates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *               - status
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *               status:
 *                 type: string
 *                 example: "Inactive"
 *     responses:
 *       200:
 *         description: Successfully updated status for specified VAT rates
 */
router.patch('/vat-rates/bulk-status', updateBulkStatus);

/**
 * @swagger
 * /api/v1/vat-compliance/vat-rates/{id}:
 *   patch:
 *     summary: Partially update a VAT rate
 *     tags: [VAT Rates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The VAT rate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               rate:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: VAT rate updated successfully
 */
router.patch('/vat-rates/:id', updateVatRate);

/**
 * @swagger
 * /api/v1/vat-compliance/vat-rates/{id}:
 *   delete:
 *     summary: Delete a single VAT rate
 *     tags: [VAT Rates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The VAT rate ID
 *     responses:
 *       200:
 *         description: VAT rate deleted successfully
 */
router.delete('/vat-rates/:id', deleteVatRates);

/**
 * @swagger
 * /api/v1/vat-compliance/vat-rates:
 *   delete:
 *     summary: Bulk delete multiple VAT rates
 *     tags: [VAT Rates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *     responses:
 *       200:
 *         description: Successfully deleted specified VAT rates
 */
router.delete('/vat-rates', deleteVatRates);

module.exports = router;
