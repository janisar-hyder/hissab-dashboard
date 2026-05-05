const express = require('express');
const router = express.Router();
const deliveryNotesController = require('./delivery-notes.controller');
const auth = require('../../../middleware/auth');

// All routes are protected
router.use(auth);

/**
 * @swagger
 * components:
 *   schemas:
 *     DeliveryNote:
 *       type: object
 *       required:
 *         - delivery_note_number
 *         - customer_id
 *         - delivery_date
 *         - details
 *       properties:
 *         delivery_note_number:
 *           type: string
 *         customer_id:
 *           type: integer
 *         quotation_id:
 *           type: integer
 *         invoice_id:
 *           type: integer
 *         delivery_date:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [Draft, Sent, Delivered, Cancelled]
 *         delivery_address:
 *           type: string
 *         shipping_method:
 *           type: string
 *         tracking_number:
 *           type: string
 *         notes:
 *           type: string
 *         terms_and_conditions:
 *           type: string
 *         details:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DeliveryNoteDetail'
 *     DeliveryNoteDetail:
 *       type: object
 *       required:
 *         - item_id
 *         - quantity
 *       properties:
 *         item_id:
 *           type: integer
 *         description:
 *           type: string
 *         quantity:
 *           type: number
 *         rate:
 *           type: number
 *         line_total:
 *           type: number
 *         vat_rate_id:
 *           type: integer
 */

/**
 * @swagger
 * tags:
 *   name: Delivery Notes
 *   description: Delivery and shipment management
 */

/**
 * @swagger
 * /api/v1/sales/delivery-notes:
 *   get:
 *     summary: Get all delivery notes
 *     tags: [Delivery Notes]
 *     responses:
 *       200:
 *         description: List of delivery notes
 *   post:
 *     summary: Create a new delivery note
 *     tags: [Delivery Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryNote'
 *     responses:
 *       201:
 *         description: Created successfully
 *   delete:
 *     summary: Bulk delete delivery notes
 *     tags: [Delivery Notes]
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
  .get(deliveryNotesController.getDeliveryNotes)
  .post(deliveryNotesController.createDeliveryNote)
  .delete(deliveryNotesController.deleteDeliveryNotes);

/**
 * @swagger
 * /api/v1/sales/delivery-notes/bulk-status:
 *   patch:
 *     summary: Bulk update status
 *     tags: [Delivery Notes]
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
router.patch('/bulk-status', deliveryNotesController.updateBulkStatus);

/**
 * @swagger
 * /api/v1/sales/delivery-notes/{id}:
 *   get:
 *     summary: Get a single delivery note by ID
 *     tags: [Delivery Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Delivery note details
 *   patch:
 *     summary: Update a delivery note
 *     tags: [Delivery Notes]
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
 *             $ref: '#/components/schemas/DeliveryNote'
 *     responses:
 *       200:
 *         description: Updated successfully
 *   delete:
 *     summary: Soft delete a delivery note
 *     tags: [Delivery Notes]
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
  .get(deliveryNotesController.getDeliveryNoteById)
  .patch(deliveryNotesController.updateDeliveryNote)
  .delete(deliveryNotesController.deleteDeliveryNote);

module.exports = router;
