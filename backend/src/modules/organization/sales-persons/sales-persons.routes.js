const express = require('express');
const router = express.Router();
const { 
  getSalesPersons, 
  createSalesPerson, 
  updateSalesPerson, 
  deleteSalesPersons,
  updateBulkStatus
} = require('./sales-persons.controller');

/**
 * @swagger
 * tags:
 *   name: Sales Persons
 *   description: Sales Person management APIs under Organization
 */

/**
 * @swagger
 * /api/v1/organization/sales-persons:
 *   get:
 *     summary: Retrieve a list of all sales persons
 *     tags: [Sales Persons]
 *     responses:
 *       200:
 *         description: A successfully retrieved list of sales persons
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
router.get('/', getSalesPersons);

/**
 * @swagger
 * /api/v1/organization/sales-persons:
 *   post:
 *     summary: Create a new sales person
 *     tags: [Sales Persons]
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
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 example: "Active"
 *     responses:
 *       201:
 *         description: Sales person created successfully
 */
router.post('/', createSalesPerson);

/**
 * @swagger
 * /api/v1/organization/sales-persons/bulk-status:
 *   patch:
 *     summary: Update status for multiple sales persons
 *     tags: [Sales Persons]
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
 *         description: Successfully updated status for specified sales persons
 */
router.patch('/bulk-status', updateBulkStatus);

/**
 * @swagger
 * /api/v1/organization/sales-persons/{id}:
 *   patch:
 *     summary: Partially update a sales person
 *     tags: [Sales Persons]
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
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sales person updated successfully
 */
router.patch('/:id', updateSalesPerson);

/**
 * @swagger
 * /api/v1/organization/sales-persons/{id}:
 *   delete:
 *     summary: Delete a single sales person
 *     tags: [Sales Persons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sales person deleted successfully
 */
router.delete('/:id', deleteSalesPersons);

/**
 * @swagger
 * /api/v1/organization/sales-persons:
 *   delete:
 *     summary: Bulk delete multiple sales persons
 *     tags: [Sales Persons]
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
 *         description: Successfully deleted specified sales persons
 */
router.delete('/', deleteSalesPersons);

module.exports = router;
