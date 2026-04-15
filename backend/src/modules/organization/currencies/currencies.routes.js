const express = require('express');
const router = express.Router();
const { 
  getCurrencies, 
  createCurrency, 
  updateCurrency, 
  deleteCurrencies 
} = require('./currencies.controller');

/**
 * @swagger
 * tags:
 *   name: Currencies
 *   description: Currency management APIs under Organization
 */

/**
 * @swagger
 * /api/v1/organization/currencies:
 *   get:
 *     summary: Retrieve a list of all client currencies
 *     tags: [Currencies]
 *     responses:
 *       200:
 *         description: A successfully retrieved list of currencies
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
 *                       code:
 *                         type: string
 *                       symbol:
 *                         type: string
 *                       is_base:
 *                         type: boolean
 *                       decimal_places:
 *                         type: integer
 *                       format:
 *                         type: string
 */
router.get('/', getCurrencies);

/**
 * @swagger
 * /api/v1/organization/currencies:
 *   post:
 *     summary: Create a new currency
 *     tags: [Currencies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - symbol
 *             properties:
 *               name:
 *                 type: string
 *                 example: "US Dollar"
 *               code:
 *                 type: string
 *                 example: "USD"
 *               symbol:
 *                 type: string
 *                 example: "$"
 *               is_base:
 *                 type: boolean
 *                 example: false
 *               decimal_places:
 *                 type: integer
 *                 example: 2
 *               format:
 *                 type: string
 *                 example: "en-US"
 *     responses:
 *       201:
 *         description: Currency created successfully
 */
router.post('/', createCurrency);

/**
 * @swagger
 * /api/v1/organization/currencies/{id}:
 *   patch:
 *     summary: Update an existing currency
 *     tags: [Currencies]
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
 *               code:
 *                 type: string
 *               symbol:
 *                 type: string
 *               is_base:
 *                 type: boolean
 *               decimal_places:
 *                 type: integer
 *               format:
 *                 type: string
 *     responses:
 *       200:
 *         description: Currency updated successfully
 */
router.patch('/:id', updateCurrency);

/**
 * @swagger
 * /api/v1/organization/currencies/{id}:
 *   delete:
 *     summary: Delete a single currency
 *     tags: [Currencies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Currency deleted successfully
 */
router.delete('/:id', deleteCurrencies);

/**
 * @swagger
 * /api/v1/organization/currencies:
 *   delete:
 *     summary: Bulk delete multiple currencies
 *     tags: [Currencies]
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
 *         description: Successfully deleted specified currencies
 */
router.delete('/', deleteCurrencies);

module.exports = router;
