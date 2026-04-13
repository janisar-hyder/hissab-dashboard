const express = require('express');
const router = express.Router();
const { 
  getSubCategories, 
  createSubCategory, 
  updateSubCategory, 
  deleteSubCategories 
} = require('./sub-categories.controller');

/**
 * @swagger
 * tags:
 *   name: Sub-Categories
 *   description: Inventory sub-category management APIs (linked to Categories)
 */

/**
 * @swagger
 * /api/v1/inventory/sub-categories:
 *   get:
 *     summary: Retrieve all inventory sub-categories
 *     tags: [Sub-Categories]
 *     responses:
 *       200:
 *         description: A successfully retrieved list of sub-categories
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
 *                       category_id:
 *                         type: integer
 *                       category:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 */
router.get('/sub-categories', getSubCategories);

/**
 * @swagger
 * /api/v1/inventory/sub-categories:
 *   post:
 *     summary: Create a new inventory sub-category
 *     tags: [Sub-Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "12,000 BTU Units"
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sub-category created successfully
 */
router.post('/sub-categories', createSubCategory);

/**
 * @swagger
 * /api/v1/inventory/sub-categories/bulk-status:
 *   patch:
 *     summary: Update status for multiple sub-categories
 *     tags: [Sub-Categories]
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
 *                 example: "Active"
 *     responses:
 *       200:
 *         description: Successfully updated status for specified sub-categories
 */
router.patch('/sub-categories/bulk-status', require('./sub-categories.controller').updateBulkStatus);

/**
 * @swagger
 * /api/v1/inventory/sub-categories/{id}:
 *   patch:
 *     summary: Partially update an inventory sub-category
 *     tags: [Sub-Categories]
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
 *               category_id:
 *                 type: integer
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sub-category updated successfully
 */
router.patch('/sub-categories/:id', updateSubCategory);

/**
 * @swagger
 * /api/v1/inventory/sub-categories/{id}:
 *   delete:
 *     summary: Delete a single sub-category
 *     tags: [Sub-Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sub-category deleted successfully
 */
router.delete('/sub-categories/:id', deleteSubCategories);

/**
 * @swagger
 * /api/v1/inventory/sub-categories:
 *   delete:
 *     summary: Bulk delete sub-categories
 *     tags: [Sub-Categories]
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
 *         description: Successfully deleted specified sub-categories
 */
router.delete('/sub-categories', deleteSubCategories);


module.exports = router;
