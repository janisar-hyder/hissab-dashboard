const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  updateBulkStatus,
  deleteItems
} = require('./items.controller');

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Inventory items management APIs
 */

/**
 * @swagger
 * /api/v1/inventory/items:
 *   get:
 *     summary: Retrieve a list of inventory items
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: A successfully retrieved list of items
 */
router.get('/items', getItems);

/**
 * @swagger
 * /api/v1/inventory/items/{id}:
 *   get:
 *     summary: Get a single item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item details retrieved successfully
 */
router.get('/items/:id', getItemById);

/**
 * @swagger
 * /api/v1/inventory/items:
 *   post:
 *     summary: Create a new inventory item
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item_code
 *               - name
 *               - uom_id
 *               - category_id
 *             properties:
 *               item_code:
 *                 type: string
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               description:
 *                 type: string
 *               uom_id:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *               sub_category_id:
 *                 type: integer
 *               sales_rate:
 *                 type: number
 *               purchase_cost:
 *                 type: number
 *               status:
 *                 type: string
 *                 default: Active
 *     responses:
 *       201:
 *         description: Item created successfully
 */
router.post('/items', createItem);

/**
 * @swagger
 * /api/v1/inventory/items/bulk-status:
 *   patch:
 *     summary: Update status for multiple items
 *     tags: [Items]
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
 *         description: Successfully updated status
 */
router.patch('/items/bulk-status', updateBulkStatus);

/**
 * @swagger
 * /api/v1/inventory/items/{id}:
 *   patch:
 *     summary: Partially update an item
 *     tags: [Items]
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
 *     responses:
 *       200:
 *         description: Item updated successfully
 */
router.patch('/items/:id', updateItem);

/**
 * @swagger
 * /api/v1/inventory/items/{id}:
 *   delete:
 *     summary: Delete a single item
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item deleted successfully
 */
router.delete('/items/:id', deleteItems);

/**
 * @swagger
 * /api/v1/inventory/items:
 *   delete:
 *     summary: Bulk delete multiple items
 *     tags: [Items]
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
 *         description: Successfully deleted specified items
 */
router.delete('/items', deleteItems);

module.exports = router;
