const prisma = require('../../../config/prisma');

/**
 * @desc    Get all inventory sub-categories
 * @route   GET /api/v1/inventory/sub-categories
 */
exports.getSubCategories = async (req, res, next) => {
  try {
    const { clientId } = req.user;

    const subCategories = await prisma.inventorySubCategory.findMany({
      where: { client_id: clientId },
      orderBy: { name: 'asc' },
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      count: subCategories.length,
      data: subCategories
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new inventory sub-category
 * @route   POST /api/v1/inventory/sub-categories
 */
exports.createSubCategory = async (req, res, next) => {
  try {
    const { name, description, status, category_id } = req.body;
    const { clientId, userId } = req.user;

    if (!name || !category_id) {
      const error = new Error('Sub-category name and parent category ID are required');
      error.statusCode = 400;
      throw error;
    }

    // Verify parent category exists and belongs to client
    const parent = await prisma.inventoryCategory.findFirst({
      where: { id: parseInt(category_id), client_id: clientId }
    });

    if (!parent) {
      const error = new Error('Parent category not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }

    const subCategory = await prisma.inventorySubCategory.create({
      data: {
        client_id: clientId,
        category_id: parseInt(category_id),
        name,
        description,
        status: status || 'Active',
        created_by: userId
      }
    });

    res.status(201).json({
      success: true,
      data: subCategory
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update an inventory sub-category
 * @route   PATCH /api/v1/inventory/sub-categories/:id
 */
exports.updateSubCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status, category_id } = req.body;
    const { clientId } = req.user;
    const subCategoryId = parseInt(id);

    // Verify record exists and belongs to client
    const existing = await prisma.inventorySubCategory.findFirst({
      where: { id: subCategoryId, client_id: clientId }
    });

    if (!existing) {
      const error = new Error('Sub-category not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.inventorySubCategory.update({
      where: { id: subCategoryId },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        status: status !== undefined ? status : undefined,
        category_id: category_id !== undefined ? parseInt(category_id) : undefined,
        updated_date: new Date(),
        updated_by: req.user.userId
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
 * @desc    Delete one or more inventory sub-categories
 * @route   DELETE /api/v1/inventory/sub-categories
 * @body    { ids: [number] }
 */
exports.deleteSubCategories = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    let ids = [];

    if (req.params.id) {
      ids = [parseInt(req.params.id)];
    } else if (req.body.ids && Array.isArray(req.body.ids)) {
      ids = req.body.ids.map(id => parseInt(id));
    }

    if (ids.length === 0) {
      const error = new Error('No sub-category IDs provided for deletion');
      error.statusCode = 400;
      throw error;
    }

    const deleteResult = await prisma.inventorySubCategory.deleteMany({
      where: {
        client_id: clientId,
        id: { in: ids }
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} sub-categories`
    });
  } catch (err) {
    next(err);
  }
};
