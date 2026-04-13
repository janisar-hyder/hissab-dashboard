const prisma = require('../../../config/prisma');

/**
 * @desc    Get all inventory unit of measures
 * @route   GET /api/v1/inventory/units
 */
exports.getUnits = async (req, res, next) => {
  try {
    const { clientId } = req.user;

    const units = await prisma.inventoryUnitOfMeasure.findMany({
      where: { client_id: clientId },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      success: true,
      count: units.length,
      data: units
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new inventory unit of measure
 * @route   POST /api/v1/inventory/units
 */
exports.createUnit = async (req, res, next) => {
  try {
    const { name, status } = req.body;
    const { clientId, userId } = req.user;

    if (!name) {
      const error = new Error('Unit name is required');
      error.statusCode = 400;
      throw error;
    }

    const unit = await prisma.inventoryUnitOfMeasure.create({
      data: {
        client_id: clientId,
        name,
        status: status || 'Active',
        created_by: userId
      }
    });

    res.status(201).json({
      success: true,
      data: unit
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update an inventory unit of measure
 * @route   PATCH /api/v1/inventory/units/:id
 */
exports.updateUnit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    const { clientId, userId } = req.user;
    const unitId = parseInt(id);

    // Verify record exists and belongs to client
    const existing = await prisma.inventoryUnitOfMeasure.findFirst({
      where: { id: unitId, client_id: clientId }
    });

    if (!existing) {
      const error = new Error('Unit of Measure not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.inventoryUnitOfMeasure.update({
      where: { id: unitId },
      data: {
        name: name !== undefined ? name : undefined,
        status: status !== undefined ? status : undefined,
        updated_date: new Date(),
        updated_by: userId
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
 * @desc    Delete one or more inventory unit of measures
 * @route   DELETE /api/v1/inventory/units
 */
exports.deleteUnits = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    let ids = [];

    if (req.params.id) {
      ids = [parseInt(req.params.id)];
    } else if (req.body.ids && Array.isArray(req.body.ids)) {
      ids = req.body.ids.map(id => parseInt(id));
    }

    if (ids.length === 0) {
      const error = new Error('No unit IDs provided for deletion');
      error.statusCode = 400;
      throw error;
    }

    const deleteResult = await prisma.inventoryUnitOfMeasure.deleteMany({
      where: {
        client_id: clientId,
        id: { in: ids }
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} unit(s) of measure`
    });
  } catch (err) {
    // Check for Prisma foreign key constraint error (P2003)
    if (err.code === 'P2003') {
      const error = new Error('One or more units cannot be deleted because they are currently linked to inventory items.');
      error.statusCode = 400;
      return next(error);
    }
    next(err);
  }
};

/**
 * @desc    Update status for multiple units of measure
 * @route   PATCH /api/v1/inventory/units/bulk-status
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

    const updateResult = await prisma.inventoryUnitOfMeasure.updateMany({
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
      message: `Successfully updated status to ${status} for ${updateResult.count} unit(s) of measure`
    });
  } catch (err) {
    next(err);
  }
};
