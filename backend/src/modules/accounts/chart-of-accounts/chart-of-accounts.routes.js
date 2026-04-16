const express = require('express');
const router = express.Router();
const { 
  getAccounts, 
  createAccount, 
  updateAccount, 
  deleteAccounts,
  bulkStatusUpdate
} = require('./chart-of-accounts.controller');

/**
 * @swagger
 * tags:
 *   name: Chart of Accounts
 *   description: Financial account structure management
 */

/**
 * @swagger
 * /api/v1/accounts/chart-of-accounts:
 *   get:
 *     summary: Retrieve a list of all client accounts
 *     tags: [Chart of Accounts]
 *     responses:
 *       200:
 *         description: Successfully retrieved list of accounts
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
 */
router.get('/', getAccounts);

/**
 * @swagger
 * /api/v1/accounts/chart-of-accounts:
 *   post:
 *     summary: Create a new account
 *     tags: [Chart of Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               parent_id:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created successfully
 */
router.post('/', createAccount);

/**
 * @swagger
 * /api/v1/accounts/chart-of-accounts/bulk-status:
 *   patch:
 *     summary: Bulk update status of accounts
 *     tags: [Chart of Accounts]
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
 *                 enum: [Active, Inactive]
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.patch('/bulk-status', bulkStatusUpdate);

/**
 * @swagger
 * /api/v1/accounts/chart-of-accounts/{id}:
 *   patch:
 *     summary: Update an existing account
 *     tags: [Chart of Accounts]
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
 *               type:
 *                 type: string
 *               parent_id:
 *                 type: integer
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account updated successfully
 */
router.patch('/:id', updateAccount);

/**
 * @swagger
 * /api/v1/accounts/chart-of-accounts:
 *   delete:
 *     summary: Bulk delete multiple accounts
 *     tags: [Chart of Accounts]
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
 *         description: Successfully deleted specified accounts
 */
router.delete('/', deleteAccounts);

/**
 * @swagger
 * /api/v1/accounts/chart-of-accounts/{id}:
 *   delete:
 *     summary: Delete a single account
 *     tags: [Chart of Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Account deleted successfully
 */
router.delete('/:id', deleteAccounts);

module.exports = router;
