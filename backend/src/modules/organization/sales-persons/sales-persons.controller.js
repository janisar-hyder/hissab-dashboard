const prisma = require('../../../config/prisma');

/**
 * @desc    Get all sales persons
 * @route   GET /api/v1/organization/sales-persons
 */
exports.getSalesPersons = async (req, res, next) => {
  try {
    const { clientId } = req.user;

    const persons = await prisma.salesPerson.findMany({
      where: { client_id: clientId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
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
      count: persons.length,
      data: persons
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new sales person
 * @route   POST /api/v1/organization/sales-persons
 */
exports.createSalesPerson = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;
    const { clientId, userId } = req.user;

    if (!name) {
      const error = new Error('Sales person name is required');
      error.statusCode = 400;
      throw error;
    }

    const person = await prisma.salesPerson.create({
      data: {
        client_id: clientId,
        name,
        description: description || null,
        status: status || 'Active',
        created_by: userId
      },
      select: {
        id: true,
        name: true,
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
      data: person
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a sales person
 * @route   PATCH /api/v1/organization/sales-persons/:id
 */
exports.updateSalesPerson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    const { clientId, userId } = req.user;
    const personId = parseInt(id);

    // Verify record exists and belongs to client
    const existing = await prisma.salesPerson.findFirst({
      where: { id: personId, client_id: clientId }
    });

    if (!existing) {
      const error = new Error('Sales person not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.salesPerson.update({
      where: { id: personId },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        status: status !== undefined ? status : undefined,
        updated_date: new Date(),
        updated_by: userId
      },
      select: {
        id: true,
        name: true,
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
 * @desc    Delete one or more sales persons
 * @route   DELETE /api/v1/organization/sales-persons
 */
exports.deleteSalesPersons = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    let ids = [];

    if (req.params.id) {
      ids = [parseInt(req.params.id)];
    } else if (req.body.ids && Array.isArray(req.body.ids)) {
      ids = req.body.ids.map(id => parseInt(id));
    }

    if (ids.length === 0) {
      const error = new Error('No sales person IDs provided for deletion');
      error.statusCode = 400;
      throw error;
    }

    const deleteResult = await prisma.salesPerson.deleteMany({
      where: {
        client_id: clientId,
        id: { in: ids }
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} sales persons`
    });
  } catch (err) {
    // Check for Prisma foreign key constraint error
    if (err.code === 'P2003') {
      const error = new Error('One or more sales persons cannot be deleted because they are currently in use.');
      error.statusCode = 400;
      return next(error);
    }
    next(err);
  }
};

/**
 * @desc    Update status for multiple sales persons
 * @route   PATCH /api/v1/organization/sales-persons/bulk-status
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

    const updateResult = await prisma.salesPerson.updateMany({
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
      message: `Successfully updated status to ${status} for ${updateResult.count} sales persons`
    });
  } catch (err) {
    next(err);
  }
};
