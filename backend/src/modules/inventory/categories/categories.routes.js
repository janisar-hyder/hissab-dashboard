const express = require('express');
const router = express.Router();
const { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategories 
} = require('./categories.controller');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Inventory category management APIs
 */

/**
 * @swagger
 * /api/v1/inventory/categories:
 *   get:
 *     summary: Retrieve a list of all inventory categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: A successfully retrieved list of categories
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
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /api/v1/inventory/categories:
 *   post:
 *     summary: Create a new inventory category
 *     tags: [Categories]
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
 *                 example: "Installation Equipment"
 *               description:
 *                 type: string
 *                 example: "Tools and safety gear for HVAC setups"
 *               status:
 *                 type: string
 *                 example: "Active"
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.post('/categories', createCategory);

/**
 * @swagger
 * /api/v1/inventory/categories/bulk-status:
 *   patch:
 *     summary: Update status for multiple categories
 *     tags: [Categories]
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
 *         description: Successfully updated status for specified categories
 */
router.patch('/categories/bulk-status', require('./categories.controller').updateBulkStatus);

/**
 * @swagger
 * /api/v1/inventory/categories/{id}:
 *   patch:
 *     summary: Partially update an inventory category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 */
router.patch('/categories/:id', updateCategory);

/**
 * @swagger
 * /api/v1/inventory/categories/{id}:
 *   delete:
 *     summary: Delete a single inventory category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 */
router.delete('/categories/:id', deleteCategories);

/**
 * @swagger
 * /api/v1/inventory/categories:
 *   delete:
 *     summary: Bulk delete multiple inventory categories
 *     tags: [Categories]
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
 *         description: Successfully deleted specified categories
 */
router.delete('/categories', deleteCategories);


module.exports = router;
