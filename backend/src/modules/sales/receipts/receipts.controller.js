const prisma = require('../../../config/prisma');

/**
 * @desc    Get all receipts
 * @route   GET /api/v1/sales/receipts
 */
exports.getReceipts = async (req, res, next) => {
  try {
    const { clientId } = req.user;

    const receipts = await prisma.receipt.findMany({
      where: { 
        client_id: clientId,
        deleted_date: null
      },
      orderBy: { receipt_date: 'desc' },
      include: {
        customer: { select: { name: true } },
        depositAccount: { select: { name: true } }
      }
    });

    res.status(200).json({
      success: true,
      count: receipts.length,
      data: receipts
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a single receipt by ID
 * @route   GET /api/v1/sales/receipts/:id
 */
exports.getReceiptById = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    const { id } = req.params;

    const receipt = await prisma.receipt.findFirst({
      where: { 
        id: parseInt(id),
        client_id: clientId,
        deleted_date: null
      },
      include: {
        customer: true,
        depositAccount: true,
        applications: {
          include: {
            invoice: true
          }
        }
      }
    });

    if (!receipt) {
      const error = new Error('Receipt not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: receipt
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new receipt
 * @route   POST /api/v1/sales/receipts
 */
exports.createReceipt = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { applications, save_note_for_future, ...receiptData } = req.body;

    // Auto-generate receipt_number if not provided or if 'Auto Generated'
    if (!receiptData.receipt_number || receiptData.receipt_number === 'Auto Generated') {
      const lastReceipt = await prisma.receipt.findFirst({
        where: { client_id: clientId },
        orderBy: { id: 'desc' },
        select: { receipt_number: true }
      });
      let nextNum = 1;
      if (lastReceipt && lastReceipt.receipt_number) {
        const match = lastReceipt.receipt_number.match(/(\d+)$/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }
      receiptData.receipt_number = `RCP-${String(nextNum).padStart(4, '0')}`;
    }

    if (!receiptData.customer_id || !receiptData.receipt_number || !receiptData.amount_received) {
      const error = new Error('Receipt number, Customer and Amount are required');
      error.statusCode = 400;
      throw error;
    }

    // Convert receipt_date to Date object if provided as string
    if (receiptData.receipt_date && typeof receiptData.receipt_date === 'string') {
      receiptData.receipt_date = new Date(receiptData.receipt_date);
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the receipt
      const receipt = await tx.receipt.create({
        data: {
          ...receiptData,
          client_id: clientId,
          created_by: userId
        }
      });

      // 2. Handle applications if provided
      if (applications && Array.isArray(applications) && applications.length > 0) {
        for (const app of applications) {
          // Create application record
          await tx.receiptApplication.create({
            data: {
              receipt_id: receipt.id,
              invoice_id: app.invoice_id,
              amount_applied: app.amount_applied
            }
          });

          // Update invoice balance
          await tx.invoice.update({
            where: { id: app.invoice_id },
            data: {
              balance_due: { decrement: app.amount_applied },
              status: {
                // If balance becomes 0 or less, mark as Paid, else mark as Partially Paid
                // This is a simple logic, usually you'd check the new balance explicitly
                set: 'Partially Paid' // Default to Partially Paid, we can refine this later
              }
            }
          });

          // Re-check status for Paid
          const updatedInv = await tx.invoice.findUnique({ where: { id: app.invoice_id } });
          if (updatedInv.balance_due <= 0) {
            await tx.invoice.update({
              where: { id: app.invoice_id },
              data: { status: 'Paid', balance_due: 0 }
            });
          }
        }
      }

      return receipt;
    });

    if (save_note_for_future) {
      await prisma.salesModuleSettings.upsert({
        where: { client_id_module: { client_id: clientId, module: 'receipt' } },
        update: { default_note: receiptData.notes || '' },
        create: { 
          client_id: clientId, 
          module: 'receipt', 
          default_note: receiptData.notes || '' 
        }
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
 * @desc    Soft delete a receipt
 * @route   DELETE /api/v1/sales/receipts/:id
 */
exports.deleteReceipt = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { id } = req.params;

    const receipt = await prisma.receipt.findFirst({
      where: { id: parseInt(id), client_id: clientId },
      include: { applications: true }
    });

    if (!receipt) {
      const error = new Error('Receipt not found');
      error.statusCode = 404;
      throw error;
    }

    // Start a transaction to reverse applications
    await prisma.$transaction(async (tx) => {
      // 1. Reverse invoice balances
      for (const app of receipt.applications) {
        await tx.invoice.update({
          where: { id: app.invoice_id },
          data: {
            balance_due: { increment: app.amount_applied },
            status: 'Sent' // Reset to Sent or check if partially paid
          }
        });
      }

      // 2. Mark receipt as deleted
      await tx.receipt.update({
        where: { id: parseInt(id) },
        data: {
          deleted_date: new Date(),
          deleted_by: userId
        }
      });
    });

    res.status(200).json({
      success: true,
      message: 'Receipt deleted successfully and invoice balances restored'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a receipt (notes/reference only)
 * @route   PATCH /api/v1/sales/receipts/:id
 */
exports.updateReceipt = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { id } = req.params;
    const { notes, reference_number, receipt_date, payment_mode, status, save_note_for_future, attachments } = req.body;

    const receipt = await prisma.receipt.findFirst({
      where: { id: parseInt(id), client_id: clientId }
    });

    if (!receipt) {
      const error = new Error('Receipt not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.receipt.update({
      where: { id: parseInt(id) },
      data: {
        notes,
        reference_number,
        status,
        receipt_date: receipt_date ? new Date(receipt_date) : undefined,
        payment_mode,
        attachments,
        updated_by: userId,
        updated_date: new Date()
      }
    });

    if (save_note_for_future) {
      await prisma.salesModuleSettings.upsert({
        where: { client_id_module: { client_id: clientId, module: 'receipt' } },
        update: { default_note: notes || '' },
        create: { 
          client_id: clientId, 
          module: 'receipt', 
          default_note: notes || '' 
        }
      });
    }

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Bulk delete receipts
 * @route   DELETE /api/v1/sales/receipts
 */
exports.deleteReceipts = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      const error = new Error('IDs array is required');
      error.statusCode = 400;
      throw error;
    }

    await prisma.$transaction(async (tx) => {
      for (const id of ids) {
        const receipt = await tx.receipt.findFirst({
          where: { id: parseInt(id), client_id: clientId },
          include: { applications: true }
        });

        if (receipt) {
          // Reverse invoice balances
          for (const app of receipt.applications) {
            await tx.invoice.update({
              where: { id: app.invoice_id },
              data: {
                balance_due: { increment: app.amount_applied },
                status: 'Partially Paid' // Fallback status
              }
            });
          }

          // Mark as deleted
          await tx.receipt.update({
            where: { id: parseInt(id) },
            data: {
              deleted_date: new Date(),
              deleted_by: userId
            }
          });
        }
      }
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${ids.length} receipts and restored invoice balances`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Bulk update receipt status
 * @route   PATCH /api/v1/sales/receipts/bulk-status
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

    await prisma.receipt.updateMany({
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
      message: `Updated status for ${ids.length} receipts`
    });
  } catch (err) {
    next(err);
  }
};
