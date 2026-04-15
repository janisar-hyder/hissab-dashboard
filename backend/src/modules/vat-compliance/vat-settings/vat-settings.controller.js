const prisma = require('../../../config/prisma');

/**
 * @desc    Get VAT settings for the current client
 * @route   GET /api/v1/vat-compliance/settings
 */
exports.getVatSettings = async (req, res, next) => {
  try {
    const { clientId } = req.user;

    const settings = await prisma.vatSetting.findUnique({
      where: { client_id: clientId },
      select: {
        client_id: true,
        is_vat_registered: true,
        tax_registration_number: true,
        vat_registered_on: true,
        updated_date: true,
        updated_by: true
      }
    });

    if (!settings) {
      return res.status(200).json({
        success: true,
        data: {
          client_id: clientId,
          is_vat_registered: false,
          tax_registration_number: null,
          vat_registered_on: null
        }
      });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update VAT settings for the current client
 * @route   PATCH /api/v1/vat-compliance/settings
 */
exports.updateVatSettings = async (req, res, next) => {
  try {
    const { is_vat_registered, tax_registration_number, vat_registered_on } = req.body;
    const { clientId, userId } = req.user;

    const settings = await prisma.vatSetting.upsert({
      where: { client_id: clientId },
      update: {
        is_vat_registered: is_vat_registered !== undefined ? is_vat_registered : undefined,
        tax_registration_number: tax_registration_number !== undefined ? tax_registration_number : undefined,
        vat_registered_on: vat_registered_on ? new Date(vat_registered_on) : undefined,
        updated_by: userId
      },
      create: {
        client_id: clientId,
        is_vat_registered: is_vat_registered || false,
        tax_registration_number: tax_registration_number || null,
        vat_registered_on: vat_registered_on ? new Date(vat_registered_on) : null,
        updated_by: userId
      },
      select: {
        client_id: true,
        is_vat_registered: true,
        tax_registration_number: true,
        vat_registered_on: true,
        updated_date: true,
        updated_by: true
      }
    });

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (err) {
    next(err);
  }
};
