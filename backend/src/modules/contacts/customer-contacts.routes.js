const express = require('express');
const router = express.Router();
const {
  getCustomerContacts,
  createCustomerContact,
  updateCustomerContact,
  deleteCustomerContacts
} = require('./customer-contacts.controller');

/**
 * @swagger
 * tags:
 *   name: CustomerContacts
 *   description: Customer contact management APIs
 */

/**
 * @swagger
 * /api/v1/contacts/customer-contacts:
 *   get:
 *     summary: Retrieve customer contacts
 *     tags: [CustomerContacts]
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *         description: Filter by customer ID
 *     responses:
 *       200:
 *         description: Successfully retrieved contacts
 */
router.get('/', getCustomerContacts);

/**
 * @swagger
 * /api/v1/contacts/customer-contacts:
 *   post:
 *     summary: Create a new customer contact
 *     tags: [CustomerContacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - first_name
 *             properties:
 *               customer_id:
 *                 type: integer
 *               salutation:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               designation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contact created successfully
 */
router.post('/', createCustomerContact);

/**
 * @swagger
 * /api/v1/contacts/customer-contacts/{id}:
 *   patch:
 *     summary: Update a customer contact
 *     tags: [CustomerContacts]
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
 *         description: Contact updated successfully
 */
router.patch('/:id', updateCustomerContact);

/**
 * @swagger
 * /api/v1/contacts/customer-contacts/{id}:
 *   delete:
 *     summary: Delete a single customer contact
 *     tags: [CustomerContacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 */
router.delete('/:id', deleteCustomerContacts);

/**
 * @swagger
 * /api/v1/contacts/customer-contacts:
 *   delete:
 *     summary: Bulk delete customer contacts
 *     tags: [CustomerContacts]
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
 *         description: Contacts deleted successfully
 */
router.delete('/', deleteCustomerContacts);

module.exports = router;
