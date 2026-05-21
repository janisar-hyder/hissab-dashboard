const prisma = require('../../../config/prisma');

/**
 * @desc    Get all customers
 * @route   GET /api/v1/sales/customers
 */
exports.getCustomers = async (req, res, next) => {
  try {
    const { clientId } = req.user;

    const customers = await prisma.customer.findMany({
      where: { 
        client_id: clientId,
        deleted_date: null 
      },
      orderBy: { name: 'asc' },
      include: {
        currency: {
          select: {
            id: true,
            name: true,
            code: true,
            symbol: true
          }
        },
        creditNotes: {
          where: { deleted_date: null },
          select: {
            sub_total: true,
            balance: true
          }
        },
        _count: {
          select: { contacts: true }
        }
      }
    });

    const customersWithCredits = customers.map(customer => {
      const total_credit = customer.creditNotes.reduce((sum, cn) => sum + Number(cn.sub_total || 0), 0);
      const available_credit = customer.creditNotes.reduce((sum, cn) => sum + Number(cn.balance || 0), 0);
      
      const { creditNotes, ...customerData } = customer;
      return {
        ...customerData,
        total_credit,
        available_credit
      };
    });

    res.status(200).json({
      success: true,
      count: customersWithCredits.length,
      data: customersWithCredits
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single customer by ID
 * @route   GET /api/v1/sales/customers/:id
 */
exports.getCustomerById = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    const { id } = req.params;

    const customer = await prisma.customer.findFirst({
      where: { 
        id: parseInt(id),
        client_id: clientId,
        deleted_date: null
      },
      include: {
        currency: true,
        contacts: true,
        creditNotes: {
          where: { deleted_date: null },
          select: {
            sub_total: true,
            balance: true
          }
        }
      }
    });

    if (!customer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }

    const total_credit = customer.creditNotes.reduce((sum, cn) => sum + Number(cn.sub_total || 0), 0);
    const available_credit = customer.creditNotes.reduce((sum, cn) => sum + Number(cn.balance || 0), 0);

    const { creditNotes, ...customerData } = customer;

    res.status(200).json({
      success: true,
      data: {
        ...customerData,
        total_credit,
        available_credit
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new customer
 * @route   POST /api/v1/sales/customers
 */
exports.createCustomer = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const data = req.body;

    if (!data.name) {
      const error = new Error('Customer name is required');
      error.statusCode = 400;
      throw error;
    }

    const customer = await prisma.customer.create({
      data: {
        ...data,
        client_id: clientId,
        created_by: userId,
        is_active: data.is_active !== undefined ? data.is_active : true
      }
    });

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a customer
 * @route   PATCH /api/v1/sales/customers/:id
 */
exports.updateCustomer = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { id } = req.params;
    const data = req.body;

    // Verify ownership
    const existing = await prisma.customer.findFirst({
      where: { id: parseInt(id), client_id: clientId }
    });

    if (!existing) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }

    // Filter out restricted fields
    const { id: _, client_id: __, created_by: ___, created_date: ____, ...updateData } = data;

    const updated = await prisma.customer.update({
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
 * @desc    Bulk update customer status (is_active)
 * @route   PATCH /api/v1/sales/customers/bulk-status
 */
exports.updateBulkStatus = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { ids, is_active } = req.body;

    if (!ids || !Array.isArray(ids) || is_active === undefined) {
      const error = new Error('IDs array and is_active are required');
      error.statusCode = 400;
      throw error;
    }

    await prisma.customer.updateMany({
      where: {
        id: { in: ids.map(id => parseInt(id)) },
        client_id: clientId
      },
      data: {
        is_active,
        updated_by: userId,
        updated_date: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: `Updated status for ${ids.length} customers`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete (soft-delete) one or more customers
 * @route   DELETE /api/v1/sales/customers
 */
exports.deleteCustomers = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    let ids = [];

    if (req.params.id) {
      ids = [parseInt(req.params.id)];
    } else if (req.body.ids && Array.isArray(req.body.ids)) {
      ids = req.body.ids.map(id => parseInt(id));
    }

    if (ids.length === 0) {
      const error = new Error('No customer IDs provided for deletion');
      error.statusCode = 400;
      throw error;
    }

    // Soft delete by setting deleted_at
    await prisma.customer.updateMany({
      where: {
        id: { in: ids },
        client_id: clientId
      },
      data: {
        deleted_date: new Date(),
        deleted_by: userId,
        updated_by: userId,
        updated_date: new Date(),
        is_active: false
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${ids.length} customers`
    });
  } catch (err) {
    next(err);
  }
};
