const prisma = require('../../../config/prisma');

/**
 * @desc    Get all invoices
 * @route   GET /api/v1/sales/invoices
 */
exports.getInvoices = async (req, res, next) => {
  try {
    const { clientId } = req.user;

    const invoices = await prisma.invoice.findMany({
      where: { 
        client_id: clientId,
        deleted_date: null
      },
      orderBy: { invoice_date: 'desc' },
      include: {
        customer: { select: { name: true } },
        currency: { select: { code: true, symbol: true } },
        salesPerson: { select: { name: true } },
        salesPartner: { select: { name: true } }
      }
    });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a single invoice by ID
 * @route   GET /api/v1/sales/invoices/:id
 */
exports.getInvoiceById = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    const { id } = req.params;

    const invoice = await prisma.invoice.findFirst({
      where: { 
        id: parseInt(id),
        client_id: clientId,
        deleted_date: null
      },
      include: {
        customer: true,
        currency: true,
        salesPerson: true,
        salesPartner: true,
        quotation: true,
        details: {
          include: {
            item: true,
            vatRate: true
          }
        }
      }
    });

    if (!invoice) {
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new invoice
 * @route   POST /api/v1/sales/invoices
 */
exports.createInvoice = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { details, ...invoiceData } = req.body;

    if (!invoiceData.customer_id || !details || !Array.isArray(details) || details.length === 0) {
      const error = new Error('Customer and at least one item are required');
      error.statusCode = 400;
      throw error;
    }

    // Parse date fields
    const dateFields = ['invoice_date', 'due_date', 'expiry_date'];
    dateFields.forEach(field => {
      if (invoiceData[field]) {
        invoiceData[field] = new Date(invoiceData[field]);
      }
    });

    // Auto-generate invoice_number if not provided
    if (!invoiceData.invoice_number) {
      const year = new Date().getFullYear();
      const lastInvoice = await prisma.invoice.findFirst({
        where: { client_id: clientId },
        orderBy: { id: 'desc' },
        select: { invoice_number: true }
      });
      let nextNum = 1;
      if (lastInvoice && lastInvoice.invoice_number) {
        const match = lastInvoice.invoice_number.match(/(\d+)$/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }
      invoiceData.invoice_number = `INV-${year}-${String(nextNum).padStart(3, '0')}`;
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          ...invoiceData,
          client_id: clientId,
          created_by: userId,
          balance_due: invoiceData.grand_total, // Initially balance due is grand total
          details: {
            create: details.map(item => {
              const detail = {
                item_id: parseInt(item.item_id),
                quantity: item.quantity,
                rate: item.rate,
                discount_amount: item.discount_amount || 0,
                line_total: item.line_total
              };
              if (item.vat_rate_id != null) detail.vat_rate_id = parseInt(item.vat_rate_id);
              if (item.description) detail.description = item.description;
              return detail;
            })
          }
        }
      });

      return invoice;
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
 * @desc    Update an invoice
 * @route   PATCH /api/v1/sales/invoices/:id
 */
exports.updateInvoice = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { id } = req.params;
    const { details, ...invoiceData } = req.body;

    const existing = await prisma.invoice.findFirst({
      where: { id: parseInt(id), client_id: clientId }
    });

    if (!existing) {
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }

    // Filter out restricted fields
    const { id: _, client_id: __, created_by: ___, created_date: ____, ...updateData } = invoiceData;

    // Parse date fields
    const dateFields = ['invoice_date', 'due_date', 'expiry_date'];
    dateFields.forEach(field => {
      if (updateData[field]) {
        updateData[field] = new Date(updateData[field]);
      }
    });

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the header
      const updatedInvoice = await tx.invoice.update({
        where: { id: parseInt(id) },
        data: {
          ...updateData,
          updated_by: userId,
          updated_date: new Date()
        }
      });

      // 2. Handle details if provided
      if (details) {
        await tx.invoiceDetail.deleteMany({
          where: { invoice_id: parseInt(id) }
        });

        await tx.invoiceDetail.createMany({
          data: details.map(item => {
            const detail = {
              invoice_id: parseInt(id),
              item_id: parseInt(item.item_id),
              quantity: item.quantity,
              rate: item.rate,
              discount_amount: item.discount_amount || 0,
              line_total: item.line_total
            };
            if (item.vat_rate_id != null) detail.vat_rate_id = parseInt(item.vat_rate_id);
            if (item.description) detail.description = item.description;
            return detail;
          })
        });
      }

      return updatedInvoice;
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
 * @desc    Soft delete an invoice
 * @route   DELETE /api/v1/sales/invoices/:id
 */
exports.deleteInvoice = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { id } = req.params;

    const existing = await prisma.invoice.findFirst({
      where: { id: parseInt(id), client_id: clientId }
    });

    if (!existing) {
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: {
        deleted_date: new Date(),
        deleted_by: userId,
        status: 'Void'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Bulk update invoice status
 * @route   PATCH /api/v1/sales/invoices/bulk-status
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

    await prisma.invoice.updateMany({
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
      message: `Updated status for ${ids.length} invoices`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Bulk delete invoices
 * @route   DELETE /api/v1/sales/invoices
 */
exports.deleteInvoices = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      const error = new Error('IDs array is required');
      error.statusCode = 400;
      throw error;
    }

    await prisma.invoice.updateMany({
      where: {
        id: { in: ids.map(id => parseInt(id)) },
        client_id: clientId
      },
      data: {
        deleted_date: new Date(),
        deleted_by: userId,
        status: 'Void'
      }
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${ids.length} invoices`
    });
  } catch (err) {
    next(err);
  }
};

