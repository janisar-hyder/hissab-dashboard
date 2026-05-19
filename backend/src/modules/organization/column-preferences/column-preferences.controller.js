const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * GET /api/v1/organization/column-preferences/:pageId
 * Returns saved column preferences for the current user on a specific page.
 */
const getPreferences = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { pageId } = req.params;

    const pref = await prisma.userColumnPreference.findUnique({
      where: {
        client_id_user_id_page_id: {
          client_id: clientId,
          user_id: userId,
          page_id: pageId,
        },
      },
    });

    res.json({
      success: true,
      data: pref ? pref.columns : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/organization/column-preferences/:pageId
 * Upserts column preferences for the current user on a specific page.
 * Body: { columns: [{ id: string, visible: boolean }, ...] }
 */
const savePreferences = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { pageId } = req.params;
    const { columns } = req.body;

    if (!columns || !Array.isArray(columns)) {
      return res.status(400).json({
        success: false,
        message: 'columns must be an array of { id, visible } objects',
      });
    }

    const pref = await prisma.userColumnPreference.upsert({
      where: {
        client_id_user_id_page_id: {
          client_id: clientId,
          user_id: userId,
          page_id: pageId,
        },
      },
      update: {
        columns: columns,
      },
      create: {
        client_id: clientId,
        user_id: userId,
        page_id: pageId,
        columns: columns,
      },
    });

    res.json({
      success: true,
      data: pref.columns,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/organization/column-preferences/:pageId
 * Deletes saved column preferences (resets to defaults).
 */
const deletePreferences = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const { pageId } = req.params;

    await prisma.userColumnPreference.deleteMany({
      where: {
        client_id: clientId,
        user_id: userId,
        page_id: pageId,
      },
    });

    res.json({
      success: true,
      message: 'Preferences reset to defaults',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPreferences,
  savePreferences,
  deletePreferences,
};
