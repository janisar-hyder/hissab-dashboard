const prisma = require('../../../config/prisma');

/**
 * @desc    Get company profile
 * @route   GET /api/v1/organization/profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const { clientId } = req.user;

    const profile = await prisma.companyProfile.findUnique({
      where: { client_id: clientId },
      select: {
        company_name: true,
        cr_number: true,
        email: true,
        phone: true,
        mobile: true,
        account_manager_name: true,
        account_manager_email: true,
        account_manager_phone: true,
        fiscal_year: true,
        fiscal_start_date: true,
        fiscal_period: true,
        logo_path: true,
        billing_address_attention: true,
        billing_address_country: true,
        billing_address_details: true,
        billing_address_city: true,
        shipment_address_attention: true,
        shipment_address_country: true,
        shipment_address_details: true,
        shipment_address_city: true,
        default_language: true,
        time_zone: true,
        updated_date: true,
        updated_by: true
      }
    });

    res.status(200).json({
      success: true,
      data: profile || {}
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update company profile
 * @route   PATCH /api/v1/organization/profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { clientId, userId } = req.user;
    const body = req.body;

    // Map incoming request fields to valid Prisma schema fields
    const profileData = {};
    const fieldMap = {
      company_name: 'company_name',
      cr_number: 'cr_number',
      email: 'email',
      phone: 'phone',
      mobile: 'mobile',
      fiscal_year: 'fiscal_year',
      fiscal_start_date: 'fiscal_start_date',
      fiscal_period: 'fiscal_period',
      logo_path: 'logo_path',
      default_language: 'default_language',
      time_zone: 'time_zone',
      date_format: 'date_format',
      currency_format: 'currency_format',
      account_manager_name: 'account_manager_name',
      account_manager_email: 'account_manager_email',
      account_manager_phone: 'account_manager_phone',
      // Billing address fields (accept both alias and canonical names)
      billing_address: 'billing_address_details',
      billing_address_details: 'billing_address_details',
      billing_address_attention: 'billing_address_attention',
      billing_city: 'billing_address_city',
      billing_address_city: 'billing_address_city',
      billing_address_country: 'billing_address_country',
      // Shipment address fields
      shipment_address_attention: 'shipment_address_attention',
      shipment_address_city: 'shipment_address_city',
      shipment_address_country: 'shipment_address_country',
      shipment_address_details: 'shipment_address_details',
    };

    for (const [inputKey, prismaKey] of Object.entries(fieldMap)) {
      if (body[inputKey] !== undefined) {
        profileData[prismaKey] = body[inputKey];
      }
    }

    // Use upsert to handle both creation and update
    const profile = await prisma.companyProfile.upsert({
      where: { client_id: clientId },
      update: {
        ...profileData,
        updated_date: new Date(),
        updated_by: userId
      },
      create: {
        ...profileData,
        client_id: clientId,
        updated_by: userId
      },
      select: {
        company_name: true,
        cr_number: true,
        email: true,
        phone: true,
        mobile: true,
        account_manager_name: true,
        account_manager_email: true,
        account_manager_phone: true,
        fiscal_year: true,
        fiscal_start_date: true,
        fiscal_period: true,
        logo_path: true,
        billing_address_attention: true,
        billing_address_country: true,
        billing_address_details: true,
        billing_address_city: true,
        shipment_address_attention: true,
        shipment_address_country: true,
        shipment_address_details: true,
        shipment_address_city: true,
        default_language: true,
        time_zone: true,
        updated_date: true
      }
    });

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (err) {
    next(err);
  }
};
