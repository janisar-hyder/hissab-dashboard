const express = require('express');
const router = express.Router();
const { 
  getVendors, 
  getVendorById, 
  createVendor, 
  updateVendor, 
  updateBulkStatus, 
  deleteVendors 
} = require('./vendors.controller');

/**
 * @swagger
 * tags:
 *   name: Vendors
 *   description: Purchase vendor management APIs
 */

/**
 * @swagger
 * /api/v1/purchases/vendors:
 *   get:
 *     summary: Retrieve a list of all purchase vendors
 *     tags: [Vendors]
 *     responses:
 *       200:
 *         description: A successfully retrieved list of vendors
 */
router.get('/', getVendors);

/**
 * @swagger
 * /api/v1/purchases/vendors/{id}:
 *   get:
 *     summary: Get a single vendor by ID
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vendor details retrieved successfully
 */
router.get('/:id', getVendorById);

/**
 * @swagger
 * /api/v1/purchases/vendors:
 *   post:
 *     summary: Create a new purchase vendor
 *     tags: [Vendors]
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
 *               status:
 *                 type: string
 *                 example: "Active"
 *     responses:
 *       201:
 *         description: Vendor created successfully
 */
router.post('/', createVendor);

/**
 * @swagger
 * /api/v1/purchases/vendors/bulk-status:
 *   patch:
 *     summary: Update status for multiple vendors
 *     tags: [Vendors]
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
router.patch('/bulk-status', updateBulkStatus);

/**
 * @swagger
 * /api/v1/purchases/vendors/{id}:
 *   patch:
 *     summary: Partially update a purchase vendor
 *     tags: [Vendors]
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
 *         description: Vendor updated successfully
 */
router.patch('/:id', updateVendor);

/**
 * @swagger
 * /api/v1/purchases/vendors/{id}:
 *   delete:
 *     summary: Delete a single vendor
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vendor deleted successfully
 */
router.delete('/:id', deleteVendors);

/**
 * @swagger
 * /api/v1/purchases/vendors:
 *   delete:
 *     summary: Bulk delete multiple vendors
 *     tags: [Vendors]
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
 *         description: Successfully deleted specified vendors
 */
router.delete('/', deleteVendors);

module.exports = router;
