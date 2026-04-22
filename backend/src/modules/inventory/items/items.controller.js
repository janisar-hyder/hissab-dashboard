const prisma = require('../../../config/prisma');

/**
 * @desc    Get all inventory items
 * @route   GET /api/v1/inventory/items
 */
exports.getItems = async (req, res, next) => {
  try {
    const { clientId } = req.user;

    const items = await prisma.inventoryItem.findMany({
      where: { client_id: clientId },
      orderBy: { name: 'asc' },
      include: {
        category: { select: { name: true } },
        subCategory: { select: { name: true } },
        uom: { select: { name: true } }
      }
    });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a single item by ID
 * @route   GET /api/v1/inventory/items/:id
 */
exports.getItemById = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    const { id } = req.params;

    const item = await prisma.inventoryItem.findFirst({
      where: { 
        id: parseInt(id),
        client_id: clientId
      },
      include: {
        category: true,
        subCategory: true,
        uom: true,
        salesAccount: true,
        purchaseAccount: true,
        inventoryAccount: true,
        vendor: true,
        weightUom: true,
        volumeUom: true
      }
    });

    if (!item) {
      const error = new Error('Item not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new inventory item
 * @route   POST /api/v1/inventory/items
 */
exports.createItem = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const data = req.body;

    if (!data.name || !data.item_code || !data.uom_id || !data.category_id) {
      const error = new Error('Item code, name, UOM, and category are required');
      error.statusCode = 400;
      throw error;
    }

    const item = await prisma.inventoryItem.create({
      data: {
        ...data,
        client_id: clientId,
        created_by: userId,
        status: data.status || 'Active'
      }
    });

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update an inventory item
 * @route   PATCH /api/v1/inventory/items/:id
 */
exports.updateItem = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.inventoryItem.findFirst({
      where: { id: parseInt(id), client_id: clientId }
    });

    if (!existing) {
      const error = new Error('Item not found');
      error.statusCode = 404;
      throw error;
    }

    // Filter out restricted fields
    const { id: _, client_id: __, created_by: ___, created_date: ____, ...updateData } = data;

    const updated = await prisma.inventoryItem.update({
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
 * @desc    Bulk update item status
 * @route   PATCH /api/v1/inventory/items/bulk-status
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

    await prisma.inventoryItem.updateMany({
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
      message: `Updated status for ${ids.length} items`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete (hard-delete) one or more items
 * @route   DELETE /api/v1/inventory/items
 */
exports.deleteItems = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    let ids = [];

    if (req.params.id) {
      ids = [parseInt(req.params.id)];
    } else if (req.body.ids && Array.isArray(req.body.ids)) {
      ids = req.body.ids.map(id => parseInt(id));
    }

    if (ids.length === 0) {
      const error = new Error('No item IDs provided for deletion');
      error.statusCode = 400;
      throw error;
    }

    const deleteCount = await prisma.inventoryItem.deleteMany({
      where: {
        id: { in: ids },
        client_id: clientId
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deleteCount.count} items`
    });
  } catch (err) {
    next(err);
  }
};
