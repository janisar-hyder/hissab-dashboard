const prisma = require('../../../config/prisma');

/**
 * @desc    Get all recurring invoices
 * @route   GET /api/v1/sales/recurring-invoices
 */
exports.getRecurringInvoices = async (req, res, next) => {
  try {
    const { clientId } = req.user;

    const recurringInvoices = await prisma.recurringInvoice.findMany({
      where: { 
        client_id: clientId,
        deleted_date: null
      },
      orderBy: { created_date: 'desc' },
      include: {
        customer: { select: { name: true } },
        receivableAccount: { select: { name: true } }
      }
    });

    res.status(200).json({
      success: true,
      count: recurringInvoices.length,
      data: recurringInvoices
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a single recurring invoice by ID
 * @route   GET /api/v1/sales/recurring-invoices/:id
 */
exports.getRecurringInvoiceById = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    const { id } = req.params;

    const recurringInvoice = await prisma.recurringInvoice.findFirst({
      where: { 
        id: parseInt(id),
        client_id: clientId,
        deleted_date: null
      },
      include: {
        customer: true,
        receivableAccount: true,
        details: {
          include: {
            item: true,
            vatRate: true
          }
        }
      }
    });

    if (!recurringInvoice) {
      const error = new Error('Recurring invoice not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: recurringInvoice
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new recurring invoice
 * @route   POST /api/v1/sales/recurring-invoices
 */
exports.createRecurringInvoice = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { details, ...recurringInvoiceData } = req.body;

    if (!recurringInvoiceData.customer_id || !recurringInvoiceData.profile_name || !details || !Array.isArray(details) || details.length === 0) {
      const error = new Error('Profile name, Customer and at least one item are required');
      error.statusCode = 400;
      throw error;
    }

    // Convert date strings to Date objects
    if (recurringInvoiceData.starts_on) recurringInvoiceData.starts_on = new Date(recurringInvoiceData.starts_on);
    if (recurringInvoiceData.ends_on) recurringInvoiceData.ends_on = new Date(recurringInvoiceData.ends_on);
    if (recurringInvoiceData.last_invoice_date) recurringInvoiceData.last_invoice_date = new Date(recurringInvoiceData.last_invoice_date);
    if (recurringInvoiceData.next_invoice_date) {
      recurringInvoiceData.next_invoice_date = new Date(recurringInvoiceData.next_invoice_date);
    } else {
      recurringInvoiceData.next_invoice_date = recurringInvoiceData.starts_on ? new Date(recurringInvoiceData.starts_on) : new Date();
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      const recurringInvoice = await tx.recurringInvoice.create({
        data: {
          ...recurringInvoiceData,
          client_id: clientId,
          created_by: userId,
          details: {
            create: details.map(item => ({
              item_id: item.item_id,
              quantity: item.quantity,
              rate: item.rate,
              discount_amount: item.discount_amount || 0,
              vat_rate_id: item.vat_rate_id,
              line_total: item.line_total,
              description: item.description
            }))
          }
        }
      });

      return recurringInvoice;
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a recurring invoice
 * @route   PATCH /api/v1/sales/recurring-invoices/:id
 */
exports.updateRecurringInvoice = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { id } = req.params;
    const { details, ...recurringInvoiceData } = req.body;

    const existing = await prisma.recurringInvoice.findFirst({
      where: { id: parseInt(id), client_id: clientId }
    });

    if (!existing) {
      const error = new Error('Recurring invoice not found');
      error.statusCode = 404;
      throw error;
    }

    // Filter out restricted fields
    const { id: _, client_id: __, created_by: ___, created_date: ____, ...updateData } = recurringInvoiceData;

    // Convert date strings to Date objects
    if (updateData.starts_on) updateData.starts_on = new Date(updateData.starts_on);
    if (updateData.ends_on) updateData.ends_on = new Date(updateData.ends_on);
    if (updateData.last_invoice_date) updateData.last_invoice_date = new Date(updateData.last_invoice_date);
    if (updateData.next_invoice_date) updateData.next_invoice_date = new Date(updateData.next_invoice_date);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the header
      const updatedRecurringInvoice = await tx.recurringInvoice.update({
        where: { id: parseInt(id) },
        data: {
          ...updateData,
          updated_by: userId,
          updated_date: new Date()
        }
      });

      // 2. Handle details if provided
      if (details) {
        await tx.recurringInvoiceDetail.deleteMany({
          where: { recurring_invoice_id: parseInt(id) }
        });

        await tx.recurringInvoiceDetail.createMany({
          data: details.map(item => ({
            recurring_invoice_id: parseInt(id),
            item_id: item.item_id,
            quantity: item.quantity,
            rate: item.rate,
            discount_amount: item.discount_amount || 0,
            vat_rate_id: item.vat_rate_id,
            line_total: item.line_total,
            description: item.description,
            created_by: userId
          }))
        });
      }

      return updatedRecurringInvoice;
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Soft delete a recurring invoice
 * @route   DELETE /api/v1/sales/recurring-invoices/:id
 */
exports.deleteRecurringInvoice = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { id } = req.params;

    const existing = await prisma.recurringInvoice.findFirst({
      where: { id: parseInt(id), client_id: clientId }
    });

    if (!existing) {
      const error = new Error('Recurring invoice not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.recurringInvoice.update({
      where: { id: parseInt(id) },
      data: {
        deleted_date: new Date(),
        deleted_by: userId,
        status: 'Inactive'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Recurring invoice deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Bulk update recurring invoice status
 * @route   PATCH /api/v1/sales/recurring-invoices/bulk-status
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

    await prisma.recurringInvoice.updateMany({
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
      message: `Updated status for ${ids.length} recurring invoices`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Bulk delete recurring invoices
 * @route   DELETE /api/v1/sales/recurring-invoices
 */
exports.deleteRecurringInvoices = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      const error = new Error('IDs array is required');
      error.statusCode = 400;
      throw error;
    }

    await prisma.recurringInvoice.updateMany({
      where: {
        id: { in: ids.map(id => parseInt(id)) },
        client_id: clientId
      },
      data: {
        deleted_date: new Date(),
        deleted_by: userId,
        status: 'Inactive'
      }
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${ids.length} recurring invoices`
    });
  } catch (err) {
    next(err);
  }
};
