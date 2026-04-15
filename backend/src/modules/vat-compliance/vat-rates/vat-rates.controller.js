const prisma = require('../../../config/prisma');

/**
 * @desc    Get all VAT rates
 * @route   GET /api/v1/vat-compliance/vat-rates
 */
exports.getVatRates = async (req, res, next) => {
  try {
    const { clientId } = req.user;

    const rates = await prisma.vatRate.findMany({
      where: { client_id: clientId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        rate: true,
        status: true,
        created_date: true,
        created_by: true,
        updated_date: true,
        updated_by: true
      }
    });

    res.status(200).json({
      success: true,
      count: rates.length,
      data: rates
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new VAT rate
 * @route   POST /api/v1/vat-compliance/vat-rates
 */
exports.createVatRate = async (req, res, next) => {
  try {
    const { name, rate, status } = req.body;
    const { clientId, userId } = req.user;

    if (!name || rate === undefined) {
      const error = new Error('VAT rate name and percentage are required');
      error.statusCode = 400;
      throw error;
    }

    const vatRate = await prisma.vatRate.create({
      data: {
        client_id: clientId,
        name,
        rate,
        status: status || 'Active',
        created_by: userId
      },
      select: {
        id: true,
        name: true,
        rate: true,
        status: true,
        created_date: true,
        created_by: true,
        updated_date: true,
        updated_by: true
      }
    });

    res.status(201).json({
      success: true,
      data: vatRate
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a VAT rate
 * @route   PATCH /api/v1/vat-compliance/vat-rates/:id
 */
exports.updateVatRate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, rate, status } = req.body;
    const { clientId, userId } = req.user;
    const rateId = parseInt(id);

    // Verify record exists and belongs to client
    const existing = await prisma.vatRate.findFirst({
      where: { id: rateId, client_id: clientId }
    });

    if (!existing) {
      const error = new Error('VAT rate not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.vatRate.update({
      where: { id: rateId },
      data: {
        name: name !== undefined ? name : undefined,
        rate: rate !== undefined ? rate : undefined,
        status: status !== undefined ? status : undefined,
        updated_date: new Date(),
        updated_by: userId
      },
      select: {
        id: true,
        name: true,
        rate: true,
        status: true,
        created_date: true,
        created_by: true,
        updated_date: true,
        updated_by: true
      }
    });

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete one or more VAT rates
 * @route   DELETE /api/v1/vat-compliance/vat-rates
 */
exports.deleteVatRates = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    let ids = [];

    if (req.params.id) {
      ids = [parseInt(req.params.id)];
    } else if (req.body.ids && Array.isArray(req.body.ids)) {
      ids = req.body.ids.map(id => parseInt(id));
    }

    if (ids.length === 0) {
      const error = new Error('No VAT rate IDs provided for deletion');
      error.statusCode = 400;
      throw error;
    }

    const deleteResult = await prisma.vatRate.deleteMany({
      where: {
        client_id: clientId,
        id: { in: ids }
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} VAT rates`
    });
  } catch (err) {
    // Check for Prisma foreign key constraint error (P2003)
    if (err.code === 'P2003') {
      const error = new Error('One or more VAT rates cannot be deleted because they are currently in use.');
      error.statusCode = 400;
      return next(error);
    }
    next(err);
  }
};

/**
 * @desc    Update status for multiple VAT rates
 * @route   PATCH /api/v1/vat-compliance/vat-rates/bulk-status
 */
exports.updateBulkStatus = async (req, res, next) => {
  try {
    const { ids, status } = req.body;
    const { clientId, userId } = req.user;

    if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) {
      const error = new Error('IDs array and status are required');
      error.statusCode = 400;
      throw error;
    }

    const updateResult = await prisma.vatRate.updateMany({
      where: {
        client_id: clientId,
        id: { in: ids.map(id => parseInt(id)) }
      },
      data: {
        status,
        updated_date: new Date(),
        updated_by: userId
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully updated status to ${status} for ${updateResult.count} VAT rates`
    });
  } catch (err) {
    next(err);
  }
};
