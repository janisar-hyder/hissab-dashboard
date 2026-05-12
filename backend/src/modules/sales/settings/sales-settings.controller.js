const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSettings = async (req, res) => {
  try {
    const { module } = req.params;
    const { clientId } = req.user;

    const settings = await prisma.salesModuleSettings.findUnique({
      where: {
        client_id_module: {
          client_id: clientId,
          module,
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: settings || { default_note: '', default_terms: '' },
    });
  } catch (error) {
    console.error(`Error fetching settings for module ${req.params.module}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch settings',
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { module } = req.params;
    const { default_note, default_terms } = req.body;
    const { clientId } = req.user;

    const settings = await prisma.salesModuleSettings.upsert({
      where: {
        client_id_module: {
          client_id: clientId,
          module,
        },
      },
      update: {
        default_note,
        default_terms,
      },
      create: {
        client_id: clientId,
        module,
        default_note,
        default_terms,
      },
    });

    res.status(200).json({
      status: 'success',
      data: settings,
    });
  } catch (error) {
    console.error(`Error updating settings for module ${req.params.module}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update settings',
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
