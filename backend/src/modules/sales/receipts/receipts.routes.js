const express = require('express');
const router = express.Router();
const receiptsController = require('./receipts.controller');
const auth = require('../../../middleware/auth');

// All routes are protected
router.use(auth);

/**
 * @swagger
 * components:
 *   schemas:
 *     Receipt:
 *       type: object
 *       required:
 *         - receipt_number
 *         - customer_id
 *         - receipt_date
 *         - amount_received
 *       properties:
 *         receipt_number:
 *           type: string
 *         customer_id:
 *           type: integer
 *         receipt_date:
 *           type: string
 *           format: date
 *         payment_mode:
 *           type: string
 *         deposit_to_id:
 *           type: integer
 *         reference_number:
 *           type: string
 *         amount_received:
 *           type: number
 *         bank_charges:
 *           type: number
 *         notes:
 *           type: string
 *         applications:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               invoice_id:
 *                 type: integer
 *               amount_applied:
 *                 type: number
 */

/**
 * @swagger
 * tags:
 *   name: Receipts
 *   description: Customer payment management
 */

/**
 * @swagger
 * /api/v1/sales/receipts:
 *   get:
 *     summary: Get all receipts
 *     tags: [Receipts]
 *     responses:
 *       200:
 *         description: List of receipts
 *   post:
 *     summary: Record a new payment (Receipt)
 *     tags: [Receipts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Receipt'
 *     responses:
 *       201:
 *         description: Created successfully
 *   delete:
 *     summary: Bulk delete receipts
 *     tags: [Receipts]
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
 *         description: Deleted successfully
 */
router
  .route('/')
  .get(receiptsController.getReceipts)
  .post(receiptsController.createReceipt)
  .delete(receiptsController.deleteReceipts);

/**
 * @swagger
 * /api/v1/sales/receipts/bulk-status:
 *   patch:
 *     summary: Bulk update status
 *     tags: [Receipts]
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/bulk-status', receiptsController.updateBulkStatus);

/**
 * @swagger
 * /api/v1/sales/receipts/{id}:
 *   get:
 *     summary: Get a single receipt by ID
 *     tags: [Receipts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Receipt details
 *   patch:
 *     summary: Update receipt info
 *     tags: [Receipts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *               reference_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated successfully
 *   delete:
 *     summary: Soft delete a receipt
 *     tags: [Receipts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router
  .route('/:id')
  .get(receiptsController.getReceiptById)
  .patch(receiptsController.updateReceipt)
  .delete(receiptsController.deleteReceipt);

module.exports = router;
