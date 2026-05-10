const express = require('express');
const router = express.Router();
const quotationsController = require('./quotations.controller');

/**
 * @swagger
 * tags:
 *   name: Quotations
 *   description: Sales quotation management APIs
 */

/**
 * @swagger
 * /api/v1/sales/quotations:
 *   get:
 *     summary: Retrieve a list of all quotations
 *     tags: [Quotations]
 *     responses:
 *       200:
 *         description: List of quotations retrieved successfully
 */
router.get('/', quotationsController.getQuotations);

/**
 * @swagger
 * /api/v1/sales/quotations/{id}:
 *   get:
 *     summary: Get a single quotation by ID
 *     tags: [Quotations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Quotation details retrieved successfully
 */
router.get('/:id', quotationsController.getQuotationById);

/**
 * @swagger
 * /api/v1/sales/quotations:
 *   post:
 *     summary: Create a new quotation
 *     tags: [Quotations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - quotation_number
 *               - quotation_date
 *               - currency_id
 *               - details
 *             properties:
 *               customer_id:
 *                 type: integer
 *               quotation_number:
 *                 type: string
 *               quotation_date:
 *                 type: string
 *                 format: date
 *               currency_id:
 *                 type: integer
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Quotation created successfully
 */
router.post('/', quotationsController.createQuotation);

/**
 * @swagger
 * /api/v1/sales/quotations/bulk-status:
 *   patch:
 *     summary: Update status for multiple quotations
 *     tags: [Quotations]
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.patch('/bulk-status', quotationsController.updateBulkStatus);

/**
 * @swagger
 * /api/v1/sales/quotations/{id}:
 *   patch:
 *     summary: Update an existing quotation
 *     tags: [Quotations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Quotation updated successfully
 */
router.patch('/:id', quotationsController.updateQuotation);

/**
 * @swagger
 * /api/v1/sales/quotations:
 *   delete:
 *     summary: Bulk delete multiple quotations
 *     tags: [Quotations]
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
 *     responses:
 *       200:
 *         description: Quotations deleted successfully
 */
router.delete('/', quotationsController.deleteQuotations);

/**
 * @swagger
 * /api/v1/sales/quotations/{id}:
 *   delete:
 *     summary: Soft delete a quotation
 *     tags: [Quotations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Quotation deleted successfully
 */
router.delete('/:id', quotationsController.deleteQuotation);

module.exports = router;
