const express = require('express');
const router = express.Router();
const recurringInvoicesController = require('./recurring-invoices.controller');
const auth = require('../../../middleware/auth');

// All routes are protected
router.use(auth);

/**
 * @swagger
 * components:
 *   schemas:
 *     RecurringInvoice:
 *       type: object
 *       required:
 *         - profile_name
 *         - customer_id
 *         - starts_on
 *         - details
 *       properties:
 *         profile_name:
 *           type: string
 *           description: Unique name for the recurring profile
 *         customer_id:
 *           type: integer
 *         repeat_every:
 *           type: string
 *           enum: [Week, Month, Quarter, Year]
 *           default: Month
 *         starts_on:
 *           type: string
 *           format: date
 *         ends_on:
 *           type: string
 *           format: date
 *         never_expires:
 *           type: boolean
 *         payment_terms:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Draft, Active, Inactive]
 *         details:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RecurringInvoiceDetail'
 *     RecurringInvoiceDetail:
 *       type: object
 *       required:
 *         - item_id
 *         - quantity
 *         - rate
 *         - line_total
 *       properties:
 *         item_id:
 *           type: integer
 *         description:
 *           type: string
 *         quantity:
 *           type: number
 *         rate:
 *           type: number
 *         discount_amount:
 *           type: number
 *         vat_rate_id:
 *           type: integer
 *         line_total:
 *           type: number
 */

/**
 * @swagger
 * tags:
 *   name: Recurring Invoices
 *   description: Automated recurring billing management
 */

/**
 * @swagger
 * /api/v1/sales/recurring-invoices:
 *   get:
 *     summary: Get all recurring invoices
 *     tags: [Recurring Invoices]
 *     responses:
 *       200:
 *         description: List of recurring invoices
 *   post:
 *     summary: Create a new recurring invoice profile
 *     tags: [Recurring Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecurringInvoice'
 *     responses:
 *       201:
 *         description: Created successfully
 *   delete:
 *     summary: Bulk delete recurring invoices
 *     tags: [Recurring Invoices]
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
  .get(recurringInvoicesController.getRecurringInvoices)
  .post(recurringInvoicesController.createRecurringInvoice)
  .delete(recurringInvoicesController.deleteRecurringInvoices);

/**
 * @swagger
 * /api/v1/sales/recurring-invoices/bulk-status:
 *   patch:
 *     summary: Bulk update status
 *     tags: [Recurring Invoices]
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
router.patch('/bulk-status', recurringInvoicesController.updateBulkStatus);

/**
 * @swagger
 * /api/v1/sales/recurring-invoices/{id}:
 *   get:
 *     summary: Get a single recurring invoice by ID
 *     tags: [Recurring Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recurring invoice details
 *   patch:
 *     summary: Update a recurring invoice
 *     tags: [Recurring Invoices]
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
 *             $ref: '#/components/schemas/RecurringInvoice'
 *     responses:
 *       200:
 *         description: Updated successfully
 *   delete:
 *     summary: Soft delete a recurring invoice
 *     tags: [Recurring Invoices]
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
  .get(recurringInvoicesController.getRecurringInvoiceById)
  .patch(recurringInvoicesController.updateRecurringInvoice)
  .delete(recurringInvoicesController.deleteRecurringInvoice);

module.exports = router;
