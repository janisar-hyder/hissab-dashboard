const express = require('express');
const router = express.Router();
const {
  getVendorContacts,
  createVendorContact,
  updateVendorContact,
  deleteVendorContacts
} = require('./vendor-contacts.controller');

/**
 * @swagger
 * tags:
 *   name: VendorContacts
 *   description: Vendor contact management APIs
 */

/**
 * @swagger
 * /api/v1/contacts/vendor-contacts:
 *   get:
 *     summary: Retrieve vendor contacts
 *     tags: [VendorContacts]
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         schema:
 *           type: integer
 *         description: Filter by vendor ID
 *     responses:
 *       200:
 *         description: Successfully retrieved contacts
 */
router.get('/', getVendorContacts);

/**
 * @swagger
 * /api/v1/contacts/vendor-contacts:
 *   post:
 *     summary: Create a new vendor contact
 *     tags: [VendorContacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vendor_id
 *               - first_name
 *             properties:
 *               vendor_id:
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
 *               mobile:
 *                 type: string
 *               designation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contact created successfully
 */
router.post('/', createVendorContact);

/**
 * @swagger
 * /api/v1/contacts/vendor-contacts/{id}:
 *   patch:
 *     summary: Update a vendor contact
 *     tags: [VendorContacts]
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
router.patch('/:id', updateVendorContact);

/**
 * @swagger
 * /api/v1/contacts/vendor-contacts/{id}:
 *   delete:
 *     summary: Delete a single vendor contact
 *     tags: [VendorContacts]
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
router.delete('/:id', deleteVendorContacts);

/**
 * @swagger
 * /api/v1/contacts/vendor-contacts:
 *   delete:
 *     summary: Bulk delete vendor contacts
 *     tags: [VendorContacts]
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
router.delete('/', deleteVendorContacts);

module.exports = router;
