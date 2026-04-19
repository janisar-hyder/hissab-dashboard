const prisma = require('../../config/prisma');

/**
 * @desc    Get all vendor contacts for the client
 * @route   GET /api/v1/contacts/vendor-contacts
 */
exports.getVendorContacts = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    const { vendorId } = req.query;

    const where = {
      vendor: {
        client_id: clientId
      }
    };

    if (vendorId) {
      where.vendor_id = parseInt(vendorId);
    }

    const contacts = await prisma.purchaseVendorContact.findMany({
      where,
      include: {
        vendor: {
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
 * @desc    Create a new vendor contact
 * @route   POST /api/v1/contacts/vendor-contacts
 */
exports.createVendorContact = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { vendor_id, ...contactData } = req.body;

    if (!vendor_id) {
      const error = new Error('Vendor ID is required');
      error.statusCode = 400;
      throw error;
    }

    // Verify vendor belongs to client
    const vendor = await prisma.purchaseVendor.findFirst({
      where: { id: vendor_id, client_id: clientId }
    });

    if (!vendor) {
      const error = new Error('Vendor not found or access denied');
      error.statusCode = 404;
      throw error;
    }

    const contact = await prisma.purchaseVendorContact.create({
      data: {
        ...contactData,
        vendor_id,
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
 * @desc    Update a vendor contact
 * @route   PATCH /api/v1/contacts/vendor-contacts/:id
 */
exports.updateVendorContact = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { id } = req.params;
    const data = req.body;

    // Verify contact belongs to a vendor of this client
    const existing = await prisma.purchaseVendorContact.findFirst({
      where: { 
        id: parseInt(id),
        vendor: {
          client_id: clientId
        }
      }
    });

    if (!existing) {
      const error = new Error('Contact not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.purchaseVendorContact.update({
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
 * @desc    Delete vendor contact(s)
 * @route   DELETE /api/v1/contacts/vendor-contacts
 */
exports.deleteVendorContacts = async (req, res, next) => {
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
    const deleteCount = await prisma.purchaseVendorContact.deleteMany({
      where: {
        id: { in: ids },
        vendor: {
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
