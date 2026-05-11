const prisma = require('../../../config/prisma');

/**
 * @desc    Get all quotations
 * @route   GET /api/v1/sales/quotations
 */
exports.getQuotations = async (req, res, next) => {
  try {
    const { clientId } = req.user;

    const quotations = await prisma.quotation.findMany({
      where: { 
        client_id: clientId,
        deleted_date: null
      },
      orderBy: { quotation_date: 'desc' },
      include: {
        customer: { select: { name: true } },
        currency: { select: { code: true, symbol: true } },
        salesPerson: { select: { name: true } }
      }
    });

    res.status(200).json({
      success: true,
      count: quotations.length,
      data: quotations
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a single quotation by ID
 * @route   GET /api/v1/sales/quotations/:id
 */
exports.getQuotationById = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    const { id } = req.params;

    const quotation = await prisma.quotation.findFirst({
      where: { 
        id: parseInt(id),
        client_id: clientId,
        deleted_date: null
      },
      include: {
        customer: true,
        currency: true,
        salesPerson: true,
        details: {
          include: {
            item: true,
            vatRate: true
          }
        }
      }
    });

    if (!quotation) {
      const error = new Error('Quotation not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: quotation
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new quotation
 * @route   POST /api/v1/sales/quotations
 */
exports.createQuotation = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { details, save_note_for_future, save_terms_for_future, ...quotationData } = req.body;

    if (!quotationData.customer_id || !details || !Array.isArray(details) || details.length === 0) {
      const error = new Error('Customer and at least one item are required');
      error.statusCode = 400;
      throw error;
    }

    if (quotationData.quotation_date) {
      quotationData.quotation_date = new Date(quotationData.quotation_date);
    }
    if (quotationData.expiry_date) {
      quotationData.expiry_date = new Date(quotationData.expiry_date);
    }
    if (quotationData.valid_until) {
      quotationData.valid_until = new Date(quotationData.valid_until);
    }

    // Auto-generate quotation_number if not provided
    if (!quotationData.quotation_number) {
      const lastQuotation = await prisma.quotation.findFirst({
        where: { client_id: clientId },
        orderBy: { id: 'desc' },
        select: { quotation_number: true }
      });

      let nextNumber = 1;
      if (lastQuotation && lastQuotation.quotation_number) {
        const match = lastQuotation.quotation_number.match(/(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }
      quotationData.quotation_number = `QT-${String(nextNumber).padStart(4, '0')}`;
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.create({
        data: {
          ...quotationData,
          client_id: clientId,
          created_by: userId,
          details: {
            create: details.map(item => {
              const detail = {
                item_id: item.item_id,
                quantity: item.quantity,
                rate: item.rate,
                discount_amount: item.discount_amount || 0,
                line_total: item.line_total,
                description: item.description || ''
              };
              // Only include vat_rate_id if it has a valid value
              if (item.vat_rate_id != null) {
                detail.vat_rate_id = item.vat_rate_id;
              }
              return detail;
            })
          }
        }
      });

      return quotation;
    });

    if (save_note_for_future || save_terms_for_future) {
      const updateData = {};
      const createData = { client_id: clientId, module: 'quotation' };

      if (save_note_for_future) {
        updateData.default_note = quotationData.customer_notes || '';
        createData.default_note = quotationData.customer_notes || '';
      }
      if (save_terms_for_future) {
        updateData.default_terms = quotationData.terms_and_conditions || '';
        createData.default_terms = quotationData.terms_and_conditions || '';
      }

      await prisma.salesModuleSettings.upsert({
        where: { client_id_module: { client_id: clientId, module: 'quotation' } },
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
 * @desc    Update a quotation
 * @route   PATCH /api/v1/sales/quotations/:id
 */
exports.updateQuotation = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { id } = req.params;
    const { details, save_note_for_future, save_terms_for_future, ...quotationData } = req.body;

    const existing = await prisma.quotation.findFirst({
      where: { id: parseInt(id), client_id: clientId }
    });

    if (!existing) {
      const error = new Error('Quotation not found');
      error.statusCode = 404;
      throw error;
    }

    // Filter out restricted fields
    const { id: _, client_id: __, created_by: ___, created_date: ____, ...updateData } = quotationData;

    if (updateData.quotation_date) {
      updateData.quotation_date = new Date(updateData.quotation_date);
    }
    if (updateData.expiry_date) {
      updateData.expiry_date = new Date(updateData.expiry_date);
    }
    if (updateData.valid_until) {
      updateData.valid_until = new Date(updateData.valid_until);
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the header
      const updatedQuotation = await tx.quotation.update({
        where: { id: parseInt(id) },
        data: {
          ...updateData,
          updated_by: userId,
          updated_date: new Date()
        }
      });

      // 2. Handle details if provided
      if (details) {
        // Simple approach: Delete existing details and recreate
        // (Alternatively, you could diff and update, but recreate is safer for complex changes)
        await tx.quotationDetail.deleteMany({
          where: { quotation_id: parseInt(id) }
        });

        await tx.quotationDetail.createMany({
          data: details.map(item => ({
            quotation_id: parseInt(id),
            item_id: item.item_id,
            quantity: item.quantity,
            rate: item.rate,
            discount_amount: item.discount_amount || 0,
            vat_rate_id: item.vat_rate_id,
            line_total: item.line_total,
            description: item.description
          }))
        });
      }

      return updatedQuotation;
    });

    if (save_note_for_future || save_terms_for_future) {
      const updateData = {};
      const createData = { client_id: clientId, module: 'quotation' };

      if (save_note_for_future) {
        updateData.default_note = quotationData.customer_notes || '';
        createData.default_note = quotationData.customer_notes || '';
      }
      if (save_terms_for_future) {
        updateData.default_terms = quotationData.terms_and_conditions || '';
        createData.default_terms = quotationData.terms_and_conditions || '';
      }

      await prisma.salesModuleSettings.upsert({
        where: { client_id_module: { client_id: clientId, module: 'quotation' } },
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
 * @desc    Soft delete a quotation
 * @route   DELETE /api/v1/sales/quotations/:id
 */
exports.deleteQuotation = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { id } = req.params;

    const existing = await prisma.quotation.findFirst({
      where: { id: parseInt(id), client_id: clientId }
    });

    if (!existing) {
      const error = new Error('Quotation not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.quotation.update({
      where: { id: parseInt(id) },
      data: {
        deleted_date: new Date(),
        deleted_by: userId,
        status: 'Cancelled'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Quotation deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Bulk update quotation status
 * @route   PATCH /api/v1/sales/quotations/bulk-status
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

    await prisma.quotation.updateMany({
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
      message: `Updated status for ${ids.length} quotations`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Bulk delete quotations
 * @route   DELETE /api/v1/sales/quotations
 */
exports.deleteQuotations = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { ids } = req.body || {};

    if (!ids || !Array.isArray(ids)) {
      const error = new Error('IDs array is required');
      error.statusCode = 400;
      throw error;
    }

    await prisma.quotation.updateMany({
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
      message: `Deleted ${ids.length} quotations`
    });
  } catch (err) {
    next(err);
  }
};

