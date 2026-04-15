const prisma = require('../../../config/prisma');

/**
 * @desc    Get all sales partners
 * @route   GET /api/v1/organization/sales-partners
 */
exports.getSalesPartners = async (req, res, next) => {
  try {
    const { clientId } = req.user;

    const partners = await prisma.salesPartner.findMany({
      where: { client_id: clientId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        commission: true,
        description: true,
        status: true,
        created_date: true,
        created_by: true,
        updated_date: true,
        updated_by: true
      }
    });

    res.status(200).json({
      success: true,
      count: partners.length,
      data: partners
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new sales partner
 * @route   POST /api/v1/organization/sales-partners
 */
exports.createSalesPartner = async (req, res, next) => {
  try {
    const { name, commission, description, status } = req.body;
    const { clientId, userId } = req.user;

    if (!name) {
      const error = new Error('Sales partner name is required');
      error.statusCode = 400;
      throw error;
    }

    const partner = await prisma.salesPartner.create({
      data: {
        client_id: clientId,
        name,
        commission: commission !== undefined ? commission : 0.00,
        description: description || null,
        status: status || 'Active',
        created_by: userId
      },
      select: {
        id: true,
        name: true,
        commission: true,
        description: true,
        status: true,
        created_date: true,
        created_by: true,
        updated_date: true,
        updated_by: true
      }
    });

    res.status(201).json({
      success: true,
      data: partner
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a sales partner
 * @route   PATCH /api/v1/organization/sales-partners/:id
 */
exports.updateSalesPartner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, commission, description, status } = req.body;
    const { clientId, userId } = req.user;
    const partnerId = parseInt(id);

    // Verify record exists and belongs to client
    const existing = await prisma.salesPartner.findFirst({
      where: { id: partnerId, client_id: clientId }
    });

    if (!existing) {
      const error = new Error('Sales partner not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.salesPartner.update({
      where: { id: partnerId },
      data: {
        name: name !== undefined ? name : undefined,
        commission: commission !== undefined ? commission : undefined,
        description: description !== undefined ? description : undefined,
        status: status !== undefined ? status : undefined,
        updated_date: new Date(),
        updated_by: userId
      },
      select: {
        id: true,
        name: true,
        commission: true,
        description: true,
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
 * @desc    Delete one or more sales partners
 * @route   DELETE /api/v1/organization/sales-partners
 */
exports.deleteSalesPartners = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    let ids = [];

    if (req.params.id) {
      ids = [parseInt(req.params.id)];
    } else if (req.body.ids && Array.isArray(req.body.ids)) {
      ids = req.body.ids.map(id => parseInt(id));
    }

    if (ids.length === 0) {
      const error = new Error('No sales partner IDs provided for deletion');
      error.statusCode = 400;
      throw error;
    }

    const deleteResult = await prisma.salesPartner.deleteMany({
      where: {
        client_id: clientId,
        id: { in: ids }
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} sales partners`
    });
  } catch (err) {
    // Check for Prisma foreign key constraint error
    if (err.code === 'P2003') {
      const error = new Error('One or more sales partners cannot be deleted because they are currently in use.');
      error.statusCode = 400;
      return next(error);
    }
    next(err);
  }
};

/**
 * @desc    Update status for multiple sales partners
 * @route   PATCH /api/v1/organization/sales-partners/bulk-status
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

    const updateResult = await prisma.salesPartner.updateMany({
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
      message: `Successfully updated status to ${status} for ${updateResult.count} sales partners`
    });
  } catch (err) {
    next(err);
  }
};
