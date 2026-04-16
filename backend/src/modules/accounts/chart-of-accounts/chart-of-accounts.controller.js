const prisma = require('../../../config/prisma');

/**
 * @desc    Get all accounts
 * @route   GET /api/v1/accounts/chart-of-accounts
 */
exports.getAccounts = async (req, res, next) => {
  try {
    const { clientId } = req.user;

    const accounts = await prisma.chartOfAccount.findMany({
      where: { client_id: clientId },
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ],
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new account
 * @route   POST /api/v1/accounts/chart-of-accounts
 */
exports.createAccount = async (req, res, next) => {
  try {
    const { name, type, parent_id, description } = req.body;
    const { clientId, userId } = req.user;

    if (!name || !type) {
      const error = new Error('Name and type are required');
      error.statusCode = 400;
      throw error;
    }

    const account = await prisma.chartOfAccount.create({
      data: {
        client_id: clientId,
        name,
        type,
        parent_id: parent_id ? parseInt(parent_id) : null,
        description: description || null,
        created_by: userId
      }
    });

    res.status(201).json({
      success: true,
      data: account
    });
  } catch (err) {
    if (err.code === 'P2002') {
      const error = new Error('An account with this name already exists for your company.');
      error.statusCode = 400;
      return next(error);
    }
    next(err);
  }
};

/**
 * @desc    Update an account
 * @route   PATCH /api/v1/accounts/chart-of-accounts/:id
 */
exports.updateAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, parent_id, description, status } = req.body;
    const { clientId, userId } = req.user;
    const accountId = parseInt(id);

    // Verify record exists
    const existing = await prisma.chartOfAccount.findFirst({
      where: { id: accountId, client_id: clientId }
    });

    if (!existing) {
      const error = new Error('Account not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.chartOfAccount.update({
      where: { id: accountId },
      data: {
        name: name !== undefined ? name : undefined,
        type: type !== undefined ? type : undefined,
        parent_id: parent_id !== undefined ? (parent_id ? parseInt(parent_id) : null) : undefined,
        description: description !== undefined ? description : undefined,
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
    if (err.code === 'P2002') {
      const error = new Error('An account with this name already exists for your company.');
      error.statusCode = 400;
      return next(error);
    }
    next(err);
  }
};

/**
 * @desc    Bulk update status
 * @route   PATCH /api/v1/accounts/chart-of-accounts/bulk-status
 */
exports.bulkStatusUpdate = async (req, res, next) => {
  try {
    const { ids, status } = req.body;
    const { clientId, userId } = req.user;

    if (!ids || !Array.isArray(ids) || !status) {
      const error = new Error('Account IDs and status are required');
      error.statusCode = 400;
      throw error;
    }

    await prisma.chartOfAccount.updateMany({
      where: {
        id: { in: ids },
        client_id: clientId
      },
      data: {
        status,
        updated_date: new Date(),
        updated_by: userId
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully updated status for ${ids.length} accounts`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete accounts
 * @route   DELETE /api/v1/accounts/chart-of-accounts
 */
exports.deleteAccounts = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    let ids = [];

    if (req.params.id) {
      ids = [parseInt(req.params.id)];
    } else if (req.body.ids && Array.isArray(req.body.ids)) {
      ids = req.body.ids.map(id => parseInt(id));
    }

    if (ids.length === 0) {
      const error = new Error('No account IDs provided for deletion');
      error.statusCode = 400;
      throw error;
    }

    const deleteResult = await prisma.chartOfAccount.deleteMany({
      where: {
        client_id: clientId,
        id: { in: ids }
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} accounts`
    });
  } catch (err) {
    // Check for Prisma foreign key constraint error
    if (err.code === 'P2003') {
      const error = new Error('One or more accounts cannot be deleted because they are currently linked to transactions or items.');
      error.statusCode = 400;
      return next(error);
    }
    next(err);
  }
};
