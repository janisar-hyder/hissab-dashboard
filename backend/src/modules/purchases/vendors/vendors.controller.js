const prisma = require('../../../config/prisma');

/**
 * @desc    Get all purchase vendors
 * @route   GET /api/v1/purchases/vendors
 */
exports.getVendors = async (req, res, next) => {
  try {
    const { clientId } = req.user;

    const vendors = await prisma.purchaseVendor.findMany({
      where: { 
        client_id: clientId,
        deleted_date: null 
      },
      orderBy: { name: 'asc' },
      include: {
        currency: {
          select: {
            id: true,
            name: true,
            code: true,
            symbol: true
          }
        },
        _count: {
          select: { contacts: true, items: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single vendor by ID
 * @route   GET /api/v1/purchases/vendors/:id
 */
exports.getVendorById = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    const { id } = req.params;

    const vendor = await prisma.purchaseVendor.findFirst({
      where: { 
        id: parseInt(id),
        client_id: clientId,
        deleted_date: null
      },
      include: {
        currency: true,
        contacts: {
          where: {
            // Can add filters here if contact deletion is implemented
          }
        }
      }
    });

    if (!vendor) {
      const error = new Error('Vendor not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new purchase vendor
 * @route   POST /api/v1/purchases/vendors
 */
exports.createVendor = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const data = req.body;

    if (!data.name) {
      const error = new Error('Vendor name is required');
      error.statusCode = 400;
      throw error;
    }

    const vendor = await prisma.purchaseVendor.create({
      data: {
        ...data,
        client_id: clientId,
        created_by: userId,
        status: data.status || 'Active'
      }
    });

    res.status(201).json({
      success: true,
      data: vendor
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a purchase vendor
 * @route   PATCH /api/v1/purchases/vendors/:id
 */
exports.updateVendor = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { id } = req.params;
    const data = req.body;

    // Verify ownership
    const existing = await prisma.purchaseVendor.findFirst({
      where: { id: parseInt(id), client_id: clientId }
    });

    if (!existing) {
      const error = new Error('Vendor not found');
      error.statusCode = 404;
      throw error;
    }

    // Filter out restricted fields
    const { id: _, client_id: __, created_by: ___, created_date: ____, ...updateData } = data;

    const updated = await prisma.purchaseVendor.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        updated_by: userId,
        updated_date: new Date()
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
 * @desc    Bulk update vendor status
 * @route   PATCH /api/v1/purchases/vendors/bulk-status
 */
exports.updateBulkStatus = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || !status) {
      const error = new Error('IDs array and status are required');
      error.statusCode = 400;
      throw error;
    }

    await prisma.purchaseVendor.updateMany({
      where: {
        id: { in: ids.map(id => parseInt(id)) },
        client_id: clientId
      },
      data: {
        status,
        updated_by: userId,
        updated_date: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: `Updated status for ${ids.length} vendors`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete (soft-delete) one or more purchase vendors
 * @route   DELETE /api/v1/purchases/vendors
 */
exports.deleteVendors = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    let ids = [];

    if (req.params.id) {
      ids = [parseInt(req.params.id)];
    } else if (req.body.ids && Array.isArray(req.body.ids)) {
      ids = req.body.ids.map(id => parseInt(id));
    }

    if (ids.length === 0) {
      const error = new Error('No vendor IDs provided for deletion');
      error.statusCode = 400;
      throw error;
    }

    // Soft delete by setting deleted_at
    await prisma.purchaseVendor.updateMany({
      where: {
        id: { in: ids },
        client_id: clientId
      },
      data: {
        deleted_date: new Date(),
        deleted_by: userId,
        updated_by: userId,
        updated_date: new Date(),
        is_active: false,
        status: 'Inactive'
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${ids.length} vendors`
    });
  } catch (err) {
    next(err);
  }
};
