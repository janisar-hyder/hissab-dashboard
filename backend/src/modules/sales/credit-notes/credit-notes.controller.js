const prisma = require('../../../config/prisma');

/**
 * @desc    Get all credit notes
 * @route   GET /api/v1/sales/credit-notes
 */
exports.getCreditNotes = async (req, res, next) => {
  try {
    const { clientId } = req.user;

    const creditNotes = await prisma.creditNote.findMany({
      where: { 
        client_id: clientId,
        deleted_date: null
      },
      orderBy: { credit_note_date: 'desc' },
      include: {
        customer: { select: { name: true } },
        currency: { select: { code: true } }
      }
    });

    res.status(200).json({
      success: true,
      count: creditNotes.length,
      data: creditNotes
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a single credit note by ID
 * @route   GET /api/v1/sales/credit-notes/:id
 */
exports.getCreditNoteById = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    const { id } = req.params;

    const creditNote = await prisma.creditNote.findFirst({
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
        },
        applications: {
          include: {
            invoice: true
          }
        }
      }
    });

    if (!creditNote) {
      const error = new Error('Credit note not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: creditNote
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new credit note
 * @route   POST /api/v1/sales/credit-notes
 */
exports.createCreditNote = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { details, applications, save_note_for_future, save_terms_for_future, ...creditNoteData } = req.body;

    if (!creditNoteData.customer_id || !creditNoteData.credit_note_number || !details || !Array.isArray(details) || details.length === 0) {
      const error = new Error('Credit note number, Customer and at least one item are required');
      error.statusCode = 400;
      throw error;
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the credit note
      const creditNote = await tx.creditNote.create({
        data: {
          ...creditNoteData,
          client_id: clientId,
          created_by: userId,
          balance: creditNoteData.grand_total, // Initial balance is the full amount
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

      // 2. Handle applications to invoices if provided
      if (applications && Array.isArray(applications) && applications.length > 0) {
        let totalApplied = 0;
        for (const app of applications) {
          await tx.creditNoteApplication.create({
            data: {
              credit_note_id: creditNote.id,
              invoice_id: app.invoice_id,
              amount_applied: app.amount_applied
            }
          });

          // Update invoice balance
          await tx.invoice.update({
            where: { id: app.invoice_id },
            data: {
              balance_due: { decrement: app.amount_applied },
              status: 'Partially Paid' // Simplify for now
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

          totalApplied += app.amount_applied;
        }

        // Update credit note balance and status if fully applied
        const newBalance = parseFloat(creditNote.grand_total) - totalApplied;
        await tx.creditNote.update({
          where: { id: creditNote.id },
          data: {
            balance: newBalance,
            status: newBalance <= 0 ? 'Closed' : 'Open'
          }
        });
      }

      return creditNote;
    });

    if (save_note_for_future || save_terms_for_future) {
      const updateData = {};
      const createData = { client_id: clientId, module: 'credit-note' };

      if (save_note_for_future) {
        updateData.default_note = creditNoteData.customer_notes || '';
        createData.default_note = creditNoteData.customer_notes || '';
      }
      if (save_terms_for_future) {
        updateData.default_terms = creditNoteData.terms_and_conditions || '';
        createData.default_terms = creditNoteData.terms_and_conditions || '';
      }

      await prisma.salesModuleSettings.upsert({
        where: { client_id_module: { client_id: clientId, module: 'credit-note' } },
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
 * @desc    Soft delete a credit note
 * @route   DELETE /api/v1/sales/credit-notes/:id
 */
exports.deleteCreditNote = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { id } = req.params;

    const creditNote = await prisma.creditNote.findFirst({
      where: { id: parseInt(id), client_id: clientId },
      include: { applications: true }
    });

    if (!creditNote) {
      const error = new Error('Credit note not found');
      error.statusCode = 404;
      throw error;
    }

    // Start a transaction to reverse applications
    await prisma.$transaction(async (tx) => {
      // 1. Reverse invoice balances
      for (const app of creditNote.applications) {
        await tx.invoice.update({
          where: { id: app.invoice_id },
          data: {
            balance_due: { increment: app.amount_applied },
            status: 'Sent' // Reset or check
          }
        });
      }

      // 2. Mark credit note as deleted
      await tx.creditNote.update({
        where: { id: parseInt(id) },
        data: {
          deleted_date: new Date(),
          deleted_by: userId,
          status: 'Cancelled'
        }
      });
    });

    res.status(200).json({
      success: true,
      message: 'Credit note deleted and invoice balances restored'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a credit note (header only)
 * @route   PATCH /api/v1/sales/credit-notes/:id
 */
exports.updateCreditNote = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { id } = req.params;
    const { reference_number, customer_notes, terms_and_conditions, sales_person_id, save_note_for_future, save_terms_for_future } = req.body;

    const existing = await prisma.creditNote.findFirst({
      where: { id: parseInt(id), client_id: clientId }
    });

    if (!existing) {
      const error = new Error('Credit note not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.creditNote.update({
      where: { id: parseInt(id) },
      data: {
        reference_number,
        customer_notes,
        terms_and_conditions,
        sales_person_id,
        updated_by: userId,
        updated_date: new Date()
      }
    });

    if (save_note_for_future || save_terms_for_future) {
      const updateSetData = {};
      const createSetData = { client_id: clientId, module: 'credit-note' };

      if (save_note_for_future) {
        updateSetData.default_note = customer_notes || '';
        createSetData.default_note = customer_notes || '';
      }
      if (save_terms_for_future) {
        updateSetData.default_terms = terms_and_conditions || '';
        createSetData.default_terms = terms_and_conditions || '';
      }

      await prisma.salesModuleSettings.upsert({
        where: { client_id_module: { client_id: clientId, module: 'credit-note' } },
        update: updateSetData,
        create: createSetData
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
 * @desc    Bulk update credit note status
 * @route   PATCH /api/v1/sales/credit-notes/bulk-status
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

    await prisma.creditNote.updateMany({
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
      message: `Updated status for ${ids.length} credit notes`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Bulk delete credit notes
 * @route   DELETE /api/v1/sales/credit-notes
 */
exports.deleteCreditNotes = async (req, res, next) => {
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
        const creditNote = await tx.creditNote.findFirst({
          where: { id: parseInt(id), client_id: clientId },
          include: { applications: true }
        });

        if (creditNote) {
          // Reverse invoice balances
          for (const app of creditNote.applications) {
            await tx.invoice.update({
              where: { id: app.invoice_id },
              data: {
                balance_due: { increment: app.amount_applied },
                status: 'Sent'
              }
            });
          }

          // Mark as deleted
          await tx.creditNote.update({
            where: { id: parseInt(id) },
            data: {
              deleted_date: new Date(),
              deleted_by: userId,
              status: 'Cancelled'
            }
          });
        }
      }
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${ids.length} credit notes and restored invoice balances`
    });
  } catch (err) {
    next(err);
  }
};
