const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('./profile.controller');

/**
 * @swagger
 * tags:
 *   name: Company Profile
 *   description: Company Profile management APIs under Organization
 */

/**
 * @swagger
 * /api/v1/organization/profile:
 *   get:
 *     summary: Retrieve company profile details
 *     tags: [Company Profile]
 *     responses:
 *       200:
 *         description: Successfully retrieved company profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     company_name:
 *                       type: string
 *                     cr_number:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     fiscal_year:
 *                       type: string
 *                     updated_date:
 *                       type: string
 *                       format: date-time
 */
router.get('/', getProfile);

/**
 * @swagger
 * /api/v1/organization/profile:
 *   patch:
 *     summary: Update company profile details
 *     tags: [Company Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *               cr_number:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               mobile:
 *                 type: string
 *               fiscal_year:
 *                 type: string
 *               fiscal_start_date:
 *                 type: string
 *               fiscal_period:
 *                 type: string
 *               default_language:
 *                 type: string
 *               time_zone:
 *                 type: string
 *               billing_attention:
 *                 type: string
 *               billing_country:
 *                 type: string
 *               billing_address:
 *                 type: string
 *               billing_city:
 *                 type: string
 *               shipment_attention:
 *                 type: string
 *               shipment_country:
 *                 type: string
 *               shipment_address:
 *                 type: string
 *               shipment_city:
 *                 type: string
 *     responses:
 *       200:
 *         description: Company profile updated successfully
 */
router.patch('/', updateProfile);

module.exports = router;
