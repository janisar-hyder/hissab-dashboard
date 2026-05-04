const express = require('express');
const router = express.Router();
const invoicesController = require('./invoices.controller');

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Sales invoice management APIs
 */

/**
 * @swagger
 * /api/v1/sales/invoices:
 *   get:
 *     summary: Retrieve a list of all invoices
 *     tags: [Invoices]
 *     responses:
 *       200:
 *         description: List of invoices retrieved successfully
 */
router.get('/', invoicesController.getInvoices);

/**
 * @swagger
 * /api/v1/sales/invoices/{id}:
 *   get:
 *     summary: Get a single invoice by ID
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Invoice details retrieved successfully
 */
router.get('/:id', invoicesController.getInvoiceById);

/**
 * @swagger
 * /api/v1/sales/invoices:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - invoice_number
 *               - invoice_date
 *               - currency_id
 *               - details
 *             properties:
 *               customer_id:
 *                 type: integer
 *               invoice_number:
 *                 type: string
 *               invoice_date:
 *                 type: string
 *                 format: date
 *               currency_id:
 *                 type: integer
 *               sales_partner_id:
 *                 type: integer
 *               commission_percentage:
 *                 type: number
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Invoice created successfully
 */
router.post('/', invoicesController.createInvoice);

/**
 * @swagger
 * /api/v1/sales/invoices/{id}:
 *   patch:
 *     summary: Update an existing invoice
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 */
router.patch('/:id', invoicesController.updateInvoice);

/**
 * @swagger
 * /api/v1/sales/invoices/bulk-status:
 *   patch:
 *     summary: Update status for multiple invoices
 *     tags: [Invoices]
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
router.patch('/bulk-status', invoicesController.updateBulkStatus);

/**
 * @swagger
 * /api/v1/sales/invoices/{id}:
 *   delete:
 *     summary: Soft delete an invoice
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Invoice deleted successfully
 */
router.delete('/:id', invoicesController.deleteInvoice);

/**
 * @swagger
 * /api/v1/sales/invoices:
 *   delete:
 *     summary: Bulk delete multiple invoices
 *     tags: [Invoices]
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
 *         description: Invoices deleted successfully
 */
router.delete('/', invoicesController.deleteInvoices);

module.exports = router;
