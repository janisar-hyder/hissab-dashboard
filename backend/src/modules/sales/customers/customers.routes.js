const express = require('express');
const router = express.Router();
const { 
  getCustomers, 
  getCustomerById, 
  createCustomer, 
  updateCustomer, 
  updateBulkStatus, 
  deleteCustomers 
} = require('./customers.controller');

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Sales customer management APIs
 */

/**
 * @swagger
 * /api/v1/sales/customers:
 *   get:
 *     summary: Retrieve a list of all sales customers
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: A successfully retrieved list of customers
 */
router.get('/', getCustomers);

/**
 * @swagger
 * /api/v1/sales/customers/{id}:
 *   get:
 *     summary: Get a single customer by ID
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Customer details retrieved successfully
 */
router.get('/:id', getCustomerById);

/**
 * @swagger
 * /api/v1/sales/customers:
 *   post:
 *     summary: Create a new sales customer
 *     tags: [Customers]
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
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               currency_id:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Customer created successfully
 */
router.post('/', createCustomer);

/**
 * @swagger
 * /api/v1/sales/customers/bulk-status:
 *   patch:
 *     summary: Update status for multiple customers
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *               - is_active
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successfully updated status
 */
router.patch('/bulk-status', updateBulkStatus);

/**
 * @swagger
 * /api/v1/sales/customers/{id}:
 *   patch:
 *     summary: Partially update a sales customer
 *     tags: [Customers]
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
 *         description: Customer updated successfully
 */
router.patch('/:id', updateCustomer);

/**
 * @swagger
 * /api/v1/sales/customers/{id}:
 *   delete:
 *     summary: Delete a single customer
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 */
router.delete('/:id', deleteCustomers);

/**
 * @swagger
 * /api/v1/sales/customers:
 *   delete:
 *     summary: Bulk delete multiple customers
 *     tags: [Customers]
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
 *         description: Successfully deleted specified customers
 */
router.delete('/', deleteCustomers);

module.exports = router;
