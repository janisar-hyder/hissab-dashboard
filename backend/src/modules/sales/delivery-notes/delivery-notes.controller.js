const prisma = require('../../../config/prisma');

/**
 * @desc    Get all delivery notes
 * @route   GET /api/v1/sales/delivery-notes
 */
exports.getDeliveryNotes = async (req, res, next) => {
  try {
    const { clientId } = req.user;

    const deliveryNotes = await prisma.deliveryNote.findMany({
      where: { 
        client_id: clientId,
        deleted_date: null
      },
      orderBy: { created_date: 'desc' },
      include: {
        customer: { select: { name: true } },
        quotation: { select: { quotation_number: true } },
        invoice: { select: { invoice_number: true } }
      }
    });

    res.status(200).json({
      success: true,
      count: deliveryNotes.length,
      data: deliveryNotes
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a single delivery note by ID
 * @route   GET /api/v1/sales/delivery-notes/:id
 */
exports.getDeliveryNoteById = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    const { id } = req.params;

    const deliveryNote = await prisma.deliveryNote.findFirst({
      where: { 
        id: parseInt(id),
        client_id: clientId,
        deleted_date: null
      },
      include: {
        customer: true,
        quotation: true,
        invoice: true,
        details: {
          include: {
            item: true,
            vatRate: true
          }
        }
      }
    });

    if (!deliveryNote) {
      const error = new Error('Delivery note not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: deliveryNote
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new delivery note
 * @route   POST /api/v1/sales/delivery-notes
 */
exports.createDeliveryNote = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { details, save_note_for_future, save_terms_for_future, ...deliveryNoteData } = req.body;

    if (!deliveryNoteData.customer_id || !deliveryNoteData.delivery_note_number || !details || !Array.isArray(details) || details.length === 0) {
      const error = new Error('Delivery note number, Customer and at least one item are required');
      error.statusCode = 400;
      throw error;
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      const deliveryNote = await tx.deliveryNote.create({
        data: {
          ...deliveryNoteData,
          client_id: clientId,
          created_by: userId,
          details: {
            create: details.map(item => ({
              item_id: item.item_id,
              quantity: item.quantity,
              rate: item.rate,
              line_total: item.line_total,
              vat_rate_id: item.vat_rate_id,
              description: item.description,
              created_by: userId
            }))
          }
        }
      });

      return deliveryNote;
    });

    if (save_note_for_future || save_terms_for_future) {
      const updateData = {};
      const createData = { client_id: clientId, module: 'delivery-note' };

      if (save_note_for_future) {
        updateData.default_note = deliveryNoteData.notes || '';
        createData.default_note = deliveryNoteData.notes || '';
      }
      if (save_terms_for_future) {
        updateData.default_terms = deliveryNoteData.terms_and_conditions || '';
        createData.default_terms = deliveryNoteData.terms_and_conditions || '';
      }

      await prisma.salesModuleSettings.upsert({
        where: { client_id_module: { client_id: clientId, module: 'delivery-note' } },
        update: updateData,
        create: createData
      });
    }

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a delivery note
 * @route   PATCH /api/v1/sales/delivery-notes/:id
 */
exports.updateDeliveryNote = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { id } = req.params;
    const { details, save_note_for_future, save_terms_for_future, ...deliveryNoteData } = req.body;

    const existing = await prisma.deliveryNote.findFirst({
      where: { id: parseInt(id), client_id: clientId }
    });

    if (!existing) {
      const error = new Error('Delivery note not found');
      error.statusCode = 404;
      throw error;
    }

    // Filter out restricted fields
    const { id: _, client_id: __, created_by: ___, created_date: ____, ...updateData } = deliveryNoteData;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the header
      const updatedDeliveryNote = await tx.deliveryNote.update({
        where: { id: parseInt(id) },
        data: {
          ...updateData,
          updated_by: userId,
          updated_date: new Date()
        }
      });

      // 2. Handle details if provided
      if (details) {
        await tx.deliveryNoteDetail.deleteMany({
          where: { delivery_note_id: parseInt(id) }
        });

        await tx.deliveryNoteDetail.createMany({
          data: details.map(item => ({
            delivery_note_id: parseInt(id),
            item_id: item.item_id,
            quantity: item.quantity,
            rate: item.rate,
            line_total: item.line_total,
            vat_rate_id: item.vat_rate_id,
            description: item.description,
            created_by: userId
          }))
        });
      }

      return updatedDeliveryNote;
    });

    if (save_note_for_future || save_terms_for_future) {
      const updateData = {};
      const createData = { client_id: clientId, module: 'delivery-note' };

      if (save_note_for_future) {
        updateData.default_note = deliveryNoteData.notes || '';
        createData.default_note = deliveryNoteData.notes || '';
      }
      if (save_terms_for_future) {
        updateData.default_terms = deliveryNoteData.terms_and_conditions || '';
        createData.default_terms = deliveryNoteData.terms_and_conditions || '';
      }

      await prisma.salesModuleSettings.upsert({
        where: { client_id_module: { client_id: clientId, module: 'delivery-note' } },
        update: updateData,
        create: createData
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Soft delete a delivery note
 * @route   DELETE /api/v1/sales/delivery-notes/:id
 */
exports.deleteDeliveryNote = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { id } = req.params;

    const existing = await prisma.deliveryNote.findFirst({
      where: { id: parseInt(id), client_id: clientId }
    });

    if (!existing) {
      const error = new Error('Delivery note not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.deliveryNote.update({
      where: { id: parseInt(id) },
      data: {
        deleted_date: new Date(),
        deleted_by: userId,
        status: 'Cancelled'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Delivery note deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Bulk update delivery note status
 * @route   PATCH /api/v1/sales/delivery-notes/bulk-status
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

    await prisma.deliveryNote.updateMany({
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
      message: `Updated status for ${ids.length} delivery notes`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Bulk delete delivery notes
 * @route   DELETE /api/v1/sales/delivery-notes
 */
exports.deleteDeliveryNotes = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      const error = new Error('IDs array is required');
      error.statusCode = 400;
      throw error;
    }

    await prisma.deliveryNote.updateMany({
      where: {
        id: { in: ids.map(id => parseInt(id)) },
        client_id: clientId
      },
      data: {
        deleted_date: new Date(),
        deleted_by: userId,
        status: 'Cancelled'
      }
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${ids.length} delivery notes`
    });
  } catch (err) {
    next(err);
  }
};
