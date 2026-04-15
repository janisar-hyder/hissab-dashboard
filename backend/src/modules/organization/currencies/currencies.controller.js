const prisma = require('../../../config/prisma');

/**
 * @desc    Get all currencies
 * @route   GET /api/v1/organization/currencies
 */
exports.getCurrencies = async (req, res, next) => {
  try {
    const { clientId } = req.user;

    const currencies = await prisma.currency.findMany({
      where: { client_id: clientId },
      orderBy: { code: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        symbol: true,
        is_base: true,
        decimal_places: true,
        format: true,
        created_date: true,
        created_by: true,
        updated_date: true,
        updated_by: true
      }
    });

    res.status(200).json({
      success: true,
      count: currencies.length,
      data: currencies
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new currency
 * @route   POST /api/v1/organization/currencies
 */
exports.createCurrency = async (req, res, next) => {
  try {
    const { name, code, symbol, is_base, decimal_places, format } = req.body;
    const { clientId, userId } = req.user;

    if (!name || !code || !symbol) {
      const error = new Error('Name, code, and symbol are required');
      error.statusCode = 400;
      throw error;
    }

    // Hande is_base logic: only one base currency per client
    if (is_base) {
      await prisma.currency.updateMany({
        where: { client_id: clientId, is_base: true },
        data: { is_base: false }
      });
    }

    const currency = await prisma.currency.create({
      data: {
        client_id: clientId,
        name,
        code,
        symbol,
        is_base: is_base || false,
        decimal_places: decimal_places !== undefined ? decimal_places : 2,
        format: format || null,
        created_by: userId
      },
      select: {
        id: true,
        name: true,
        code: true,
        symbol: true,
        is_base: true,
        decimal_places: true,
        format: true
      }
    });

    res.status(201).json({
      success: true,
      data: currency
    });
  } catch (err) {
    if (err.code === 'P2002') {
      const error = new Error('A currency with this code already exists for your company.');
      error.statusCode = 400;
      return next(error);
    }
    next(err);
  }
};

/**
 * @desc    Update a currency
 * @route   PATCH /api/v1/organization/currencies/:id
 */
exports.updateCurrency = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, symbol, is_base, decimal_places, format } = req.body;
    const { clientId, userId } = req.user;
    const currencyId = parseInt(id);

    // Verify record exists
    const existing = await prisma.currency.findFirst({
      where: { id: currencyId, client_id: clientId }
    });

    if (!existing) {
      const error = new Error('Currency not found');
      error.statusCode = 404;
      throw error;
    }

    // Handle is_base logic
    if (is_base === true && !existing.is_base) {
      await prisma.currency.updateMany({
        where: { client_id: clientId, is_base: true },
        data: { is_base: false }
      });
    } else if (is_base === false && existing.is_base) {
      // Prevent unmarking the only base currency without setting another one
      const error = new Error('There must be exactly one base currency. Set another currency as base instead.');
      error.statusCode = 400;
      throw error;
    }

    const updated = await prisma.currency.update({
      where: { id: currencyId },
      data: {
        name: name !== undefined ? name : undefined,
        code: code !== undefined ? code : undefined,
        symbol: symbol !== undefined ? symbol : undefined,
        is_base: is_base !== undefined ? is_base : undefined,
        decimal_places: decimal_places !== undefined ? decimal_places : undefined,
        format: format !== undefined ? format : undefined,
        updated_date: new Date(),
        updated_by: userId
      },
      select: {
        id: true,
        name: true,
        code: true,
        symbol: true,
        is_base: true,
        decimal_places: true,
        format: true
      }
    });

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    if (err.code === 'P2002') {
      const error = new Error('A currency with this code already exists for your company.');
      error.statusCode = 400;
      return next(error);
    }
    next(err);
  }
};

/**
 * @desc    Delete one or more currencies
 * @route   DELETE /api/v1/organization/currencies
 */
exports.deleteCurrencies = async (req, res, next) => {
  try {
    const { clientId } = req.user;
    let ids = [];

    if (req.params.id) {
      ids = [parseInt(req.params.id)];
    } else if (req.body.ids && Array.isArray(req.body.ids)) {
      ids = req.body.ids.map(id => parseInt(id));
    }

    if (ids.length === 0) {
      const error = new Error('No currency IDs provided for deletion');
      error.statusCode = 400;
      throw error;
    }

    // Check if any of the currencies to be deleted is a base currency
    const baseCurrencies = await prisma.currency.findMany({
      where: {
        id: { in: ids },
        client_id: clientId,
        is_base: true
      }
    });

    if (baseCurrencies.length > 0) {
      const error = new Error(`Cannot delete the base currency (${baseCurrencies[0].code}). Set another currency as base first.`);
      error.statusCode = 400;
      throw error;
    }

    const deleteResult = await prisma.currency.deleteMany({
      where: {
        client_id: clientId,
        id: { in: ids }
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} currencies`
    });
  } catch (err) {
    // Check for Prisma foreign key constraint error
    if (err.code === 'P2003') {
      const error = new Error('One or more currencies cannot be deleted because they are currently used in transactions or settings.');
      error.statusCode = 400;
      return next(error);
    }
    next(err);
  }
};
