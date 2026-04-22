const prisma = require('../../config/prisma');

/**
 * @desc    Get all customer contacts for the client
 * @route   GET /api/v1/contacts/customer-contacts
 */
exports.getCustomerContacts = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    const { customerId } = req.query;

    const where = {
      customer: {
        client_id: clientId
      }
    };

    if (customerId) {
      where.customer_id = parseInt(customerId);
    }

    const contacts = await prisma.customerContact.findMany({
      where,
      include: {
        customer: {
          select: {
            name: true
          }
        }
      },
      orderBy: { first_name: 'asc' }
    });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new customer contact
 * @route   POST /api/v1/contacts/customer-contacts
 */
exports.createCustomerContact = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { customer_id, ...contactData } = req.body;

    if (!customer_id) {
      const error = new Error('Customer ID is required');
      error.statusCode = 400;
      throw error;
    }

    // Verify customer belongs to client
    const customer = await prisma.customer.findFirst({
      where: { id: customer_id, client_id: clientId }
    });

    if (!customer) {
      const error = new Error('Customer not found or access denied');
      error.statusCode = 404;
      throw error;
    }

    const contact = await prisma.customerContact.create({
      data: {
        ...contactData,
        customer_id,
        created_by: userId
      }
    });

    res.status(201).json({
      success: true,
      data: contact
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a customer contact
 * @route   PATCH /api/v1/contacts/customer-contacts/:id
 */
exports.updateCustomerContact = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { id } = req.params;
    const data = req.body;

    // Verify contact belongs to a customer of this client
    const existing = await prisma.customerContact.findFirst({
      where: { 
        id: parseInt(id),
        customer: {
          client_id: clientId
        }
      }
    });

    if (!existing) {
      const error = new Error('Contact not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.customerContact.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
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
 * @desc    Delete customer contact(s)
 * @route   DELETE /api/v1/contacts/customer-contacts
 */
exports.deleteCustomerContacts = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    let ids = [];

    if (req.params.id) {
      ids = [parseInt(req.params.id)];
    } else if (req.body.ids && Array.isArray(req.body.ids)) {
      ids = req.body.ids.map(id => parseInt(id));
    }

    if (ids.length === 0) {
      const error = new Error('No contact IDs provided');
      error.statusCode = 400;
      throw error;
    }

    // Verify all contacts belong to this client before deletion
    const deleteCount = await prisma.customerContact.deleteMany({
      where: {
        id: { in: ids },
        customer: {
          client_id: clientId
        }
      }
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${deleteCount.count} contacts`
    });
  } catch (err) {
    next(err);
  }
};
