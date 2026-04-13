const express = require('express');
const router = express.Router();
const { 
  getUnits, 
  createUnit, 
  updateUnit, 
  deleteUnits 
} = require('./units.controller');

/**
 * @swagger
 * tags:
 *   name: Units of Measure
 *   description: Management of measurement units (e.g., Kg, Pcs, Meters)
 */

/**
 * @swagger
 * /api/v1/inventory/units:
 *   get:
 *     summary: Retrieve a list of all units of measure
 *     tags: [Units of Measure]
 *     responses:
 *       200:
 *         description: Successfully retrieved units
 */
router.get('/units', getUnits);

/**
 * @swagger
 * /api/v1/inventory/units:
 *   post:
 *     summary: Create a new unit of measure
 *     tags: [Units of Measure]
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
 *                 example: "Kilograms"
 *               status:
 *                 type: string
 *                 example: "Active"
 *     responses:
 *       201:
 *         description: Unit created successfully
 */
router.post('/units', createUnit);


/**
 * @swagger
 * /api/v1/inventory/units/bulk-status:
 *   patch:
 *     summary: Update status for multiple units of measure
 *     tags: [Units of Measure]
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
 *         description: Successfully updated status for specified units
 */
router.patch('/units/bulk-status', require('./units.controller').updateBulkStatus);

/**
 * @swagger
 * /api/v1/inventory/units/{id}:
 *   patch:
 *     summary: Update a unit of measure
 *     tags: [Units of Measure]
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Unit updated successfully
 */
router.patch('/units/:id', updateUnit);

/**
 * @swagger
 * /api/v1/inventory/units/{id}:
 *   delete:
 *     summary: Delete a single unit of measure
 *     tags: [Units of Measure]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Unit deleted successfully
 */
router.delete('/units/:id', deleteUnits);

/**
 * @swagger
 * /api/v1/inventory/units:
 *   delete:
 *     summary: Bulk delete units of measure
 *     tags: [Units of Measure]
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
 *         description: Successfully deleted specified units
 */
router.delete('/units', deleteUnits);


module.exports = router;
