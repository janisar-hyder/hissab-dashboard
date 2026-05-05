const express = require('express');
const router = express.Router();
const creditNotesController = require('./credit-notes.controller');
const auth = require('../../../middleware/auth');

// All routes are protected
router.use(auth);

/**
 * @swagger
 * components:
 *   schemas:
 *     CreditNote:
 *       type: object
 *       required:
 *         - credit_note_number
 *         - customer_id
 *         - credit_note_date
 *         - details
 *       properties:
 *         credit_note_number:
 *           type: string
 *         customer_id:
 *           type: integer
 *         credit_note_date:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [Open, Closed, Cancelled]
 *         reference_number:
 *           type: string
 *         sales_person_id:
 *           type: integer
 *         currency_id:
 *           type: integer
 *         sub_total:
 *           type: number
 *         total_vat:
 *           type: number
 *         grand_total:
 *           type: number
 *         customer_notes:
 *           type: string
 *         details:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CreditNoteDetail'
 *         applications:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               invoice_id:
 *                 type: integer
 *               amount_applied:
 *                 type: number
 *     CreditNoteDetail:
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
 *         vat_rate_id:
 *           type: integer
 *         line_total:
 *           type: number
 */

/**
 * @swagger
 * tags:
 *   name: Credit Notes
 *   description: Sales returns and credits management
 */

/**
 * @swagger
 * /api/v1/sales/credit-notes:
 *   get:
 *     summary: Get all credit notes
 *     tags: [Credit Notes]
 *     responses:
 *       200:
 *         description: List of credit notes
 *   post:
 *     summary: Create a new credit note
 *     tags: [Credit Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreditNote'
 *     responses:
 *       201:
 *         description: Created successfully
 *   delete:
 *     summary: Bulk delete credit notes
 *     tags: [Credit Notes]
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
  .get(creditNotesController.getCreditNotes)
  .post(creditNotesController.createCreditNote)
  .delete(creditNotesController.deleteCreditNotes);

/**
 * @swagger
 * /api/v1/sales/credit-notes/bulk-status:
 *   patch:
 *     summary: Bulk update status
 *     tags: [Credit Notes]
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
router.patch('/bulk-status', creditNotesController.updateBulkStatus);

/**
 * @swagger
 * /api/v1/sales/credit-notes/{id}:
 *   get:
 *     summary: Get a single credit note by ID
 *     tags: [Credit Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Credit note details
 *   patch:
 *     summary: Update credit note info
 *     tags: [Credit Notes]
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
 *               reference_number:
 *                 type: string
 *               customer_notes:
 *                 type: string
 *               terms_and_conditions:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated successfully
 *   delete:
 *     summary: Soft delete a credit note
 *     tags: [Credit Notes]
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
  .get(creditNotesController.getCreditNoteById)
  .patch(creditNotesController.updateCreditNote)
  .delete(creditNotesController.deleteCreditNote);

module.exports = router;
