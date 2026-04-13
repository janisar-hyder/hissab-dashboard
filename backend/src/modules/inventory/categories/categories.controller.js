const prisma = require('../../../config/prisma');

/**
 * @desc    Get all inventory categories
 * @route   GET /api/v1/inventory/categories
 */
exports.getCategories = async (req, res, next) => {
  try {
    const { clientId } = req.user;

    const categories = await prisma.inventoryCategory.findMany({
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
      count: categories.length,
      data: categories
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new inventory category
 * @route   POST /api/v1/inventory/categories
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;
    const { clientId, userId } = req.user;

    if (!name) {
      const error = new Error('Category name is required');
      error.statusCode = 400;
      throw error;
    }

    const category = await prisma.inventoryCategory.create({
      data: {
        client_id: clientId,
        name,
        description,
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
      data: category
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update an inventory category
 * @route   PATCH /api/v1/inventory/categories/:id
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    const { clientId } = req.user;
    const categoryId = parseInt(id);

    // Verify record exists and belongs to client
    const existing = await prisma.inventoryCategory.findFirst({
      where: { id: categoryId, client_id: clientId }
    });

    if (!existing) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.inventoryCategory.update({
      where: { id: categoryId },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        status: status !== undefined ? status : undefined,
        updated_date: new Date(),
        updated_by: req.user.userId
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
 * @desc    Delete one or more inventory categories
 * @route   DELETE /api/v1/inventory/categories
 */
exports.deleteCategories = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    let ids = [];

    if (req.params.id) {
      ids = [parseInt(req.params.id)];
    } else if (req.body.ids && Array.isArray(req.body.ids)) {
      ids = req.body.ids.map(id => parseInt(id));
    }

    if (ids.length === 0) {
      const error = new Error('No category IDs provided for deletion');
      error.statusCode = 400;
      throw error;
    }

    // Prisma deleteMany returns a count
    // But we need to handle the RESTRICT error too.
    // Note: Prisma 6 handles foreign key errors by throwing a specific code (P2003)
    const deleteResult = await prisma.inventoryCategory.deleteMany({
      where: {
        client_id: clientId,
        id: { in: ids }
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} categories`
    });
  } catch (err) {
    // Check for Prisma foreign key constraint error (P2003)
    if (err.code === 'P2003') {
      const error = new Error('One or more categories cannot be deleted because they are currently linked to inventory items.');
      error.statusCode = 400;
      return next(error);
    }
    next(err);
  }
};
