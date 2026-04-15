const express = require('express');
const router = express.Router();
const { 
  getSalesPartners, 
  createSalesPartner, 
  updateSalesPartner, 
  deleteSalesPartners,
  updateBulkStatus
} = require('./sales-partners.controller');

/**
 * @swagger
 * tags:
 *   name: Sales Partners
 *   description: Sales Partner management APIs under Organization
 */

/**
 * @swagger
 * /api/v1/organization/sales-partners:
 *   get:
 *     summary: Retrieve a list of all sales partners
 *     tags: [Sales Partners]
 *     responses:
 *       200:
 *         description: A successfully retrieved list of sales partners
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
 *                       commission:
 *                         type: number
 *                         format: decimal
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 */
router.get('/', getSalesPartners);

/**
 * @swagger
 * /api/v1/organization/sales-partners:
 *   post:
 *     summary: Create a new sales partner
 *     tags: [Sales Partners]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               commission:
 *                 type: number
 *                 example: 10.00
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 example: "Active"
 *     responses:
 *       201:
 *         description: Sales partner created successfully
 */
router.post('/', createSalesPartner);

/**
 * @swagger
 * /api/v1/organization/sales-partners/bulk-status:
 *   patch:
 *     summary: Update status for multiple sales partners
 *     tags: [Sales Partners]
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
 *         description: Successfully updated status for specified sales partners
 */
router.patch('/bulk-status', updateBulkStatus);

/**
 * @swagger
 * /api/v1/organization/sales-partners/{id}:
 *   patch:
 *     summary: Partially update a sales partner
 *     tags: [Sales Partners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               commission:
 *                 type: number
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sales partner updated successfully
 */
router.patch('/:id', updateSalesPartner);

/**
 * @swagger
 * /api/v1/organization/sales-partners/{id}:
 *   delete:
 *     summary: Delete a single sales partner
 *     tags: [Sales Partners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sales partner deleted successfully
 */
router.delete('/:id', deleteSalesPartners);

/**
 * @swagger
 * /api/v1/organization/sales-partners:
 *   delete:
 *     summary: Bulk delete multiple sales partners
 *     tags: [Sales Partners]
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
 *         description: Successfully deleted specified sales partners
 */
router.delete('/', deleteSalesPartners);

module.exports = router;
