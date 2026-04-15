const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Super Admin Role
  const adminRole = await prisma.superAdminRole.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin', status: 'Active' },
  });

  // 2. Super Admin User
  const adminUser = await prisma.superAdminUser.upsert({
    where: { email: 'admin@erp.com' },
    update: {},
    create: {
      name: 'Sys Admin',
      email: 'admin@erp.com',
      password_hash: 'Haha-1234',
      role_id: adminRole.id
    },
  });

  // 3. Client (Tenant)
  const client = await prisma.client.upsert({
    where: { client_num: 'CLT-001' },
    update: {},
    create: {
      client_num: 'CLT-001',
      name: 'Test Corporation',
      cr_num: '123456-7',
      email: 'info@testcorp.com',
      phone: '+973 17000000',
      client_admin_username: 'corp_admin',
      client_admin_password: 'Pass-1234',
      account_manager_id: adminUser.id,
      created_by: adminUser.id
    },
  });

  // 4. Client Role
  const clientAdminRole = await prisma.clientRole.upsert({
    where: { client_id_name: { client_id: client.id, name: 'Client Admin' } },
    update: {},
    create: {
      client_id: client.id,
      name: 'Client Admin',
      status: 'Active'
    }
  });

  // 5. Client User
  const clientUser = await prisma.clientUser.upsert({
    where: { client_id_email: { client_id: client.id, email: 'admin@testcorp.com' } },
    update: {},
    create: {
      client_id: client.id,
      name: 'Test Client Admin',
      email: 'admin@testcorp.com',
      password_hash: 'Haha-1234',
      role_id: clientAdminRole.id,
      status: 'Active'
    }
  });

  // 6. Cleanup existing data for re-seeding
  await prisma.salesPerson.deleteMany({ where: { client_id: client.id } });
  await prisma.salesPartner.deleteMany({ where: { client_id: client.id } });
  await prisma.currency.deleteMany({ where: { client_id: client.id } });
  await prisma.chartOfAccount.deleteMany({ where: { client_id: client.id } });
  await prisma.inventoryCategory.deleteMany({ where: { client_id: client.id } });

  // 7. Chart of Accounts
  await prisma.chartOfAccount.createMany({
    data: [
      { client_id: client.id, name: 'Sales', code: '4000', type: 'Income', created_by: clientUser.id },
      { client_id: client.id, name: 'Cost of Goods Sold', code: '5000', type: 'Cost of Goods Sold', created_by: clientUser.id },
      { client_id: client.id, name: 'Inventory Asset', code: '1200', type: 'Stock', created_by: clientUser.id }
    ]
  });

  // 7. Inventory Categories
  await prisma.inventoryCategory.createMany({
    data: [
      { client_id: client.id, name: 'AC Units', status: 'Active', created_by: clientUser.id },
      { client_id: client.id, name: 'Consumables', status: 'Active', created_by: clientUser.id }
    ]
  });

  // 8. VAT Settings
  await prisma.vatSetting.upsert({
    where: { client_id: client.id },
    update: {},
    create: {
      client_id: client.id,
      is_vat_registered: true,
      tax_registration_number: '100234567800003',
      vat_registered_on: new Date('2019-01-01'),
      updated_by: clientUser.id
    }
  });

  // 9. Sales Persons
  await prisma.salesPerson.createMany({
    data: [
      { client_id: client.id, name: 'Aaliyah Khan', description: 'Focuses on the Middle East market.', status: 'Active', created_by: clientUser.id },
      { client_id: client.id, name: 'Liam Schmidt', description: 'Expert in European client relations.', status: 'Active', created_by: clientUser.id },
      { client_id: client.id, name: 'Zara Al-Farsi', description: 'Specializes in high-tech sales.', status: 'Active', created_by: clientUser.id },
      { client_id: client.id, name: 'Omar Dubois', description: 'Handles corporate accounts.', status: 'Active', created_by: clientUser.id }
    ]
  });

  // 10. Sales Partners
  await prisma.salesPartner.createMany({
    data: [
      { client_id: client.id, name: 'Jack Thomas', commission: 10.00, description: '-', status: 'Active', created_by: clientUser.id },
      { client_id: client.id, name: 'Stellar Marketing', commission: 5.00, description: 'Collaborating to enhance our offerings.', status: 'Active', created_by: clientUser.id },
      { client_id: client.id, name: 'Eco Innovations', commission: 20.00, description: '-', status: 'Active', created_by: clientUser.id },
      { client_id: client.id, name: 'Noah Patel', commission: 10.00, description: 'Working together for mutual success.', status: 'Inactive', created_by: clientUser.id }
    ]
  });

  // 11. Currencies
  await prisma.currency.createMany({
    data: [
      { client_id: client.id, name: 'Bahraini Dinar', code: 'BHD', symbol: 'BHD', is_base: true, decimal_places: 3, created_by: clientUser.id },
      { client_id: client.id, name: 'UAE Dirham', code: 'AED', symbol: 'AED', is_base: false, decimal_places: 2, created_by: clientUser.id },
      { client_id: client.id, name: 'Canadian Dollar', code: 'CAD', symbol: '$', is_base: false, decimal_places: 2, created_by: clientUser.id },
      { client_id: client.id, name: 'Euro', code: 'EUR', symbol: '€', is_base: false, decimal_places: 2, created_by: clientUser.id },
      { client_id: client.id, name: 'Pound Sterling', code: 'GBP', symbol: '£', is_base: false, decimal_places: 2, created_by: clientUser.id },
      { client_id: client.id, name: 'Pakistani Rupee', code: 'PKR', symbol: 'Rs.', is_base: false, decimal_places: 0, created_by: clientUser.id },
      { client_id: client.id, name: 'Kuwaiti Dinar', code: 'KWD', symbol: 'KWD', is_base: false, decimal_places: 3, created_by: clientUser.id },
      { client_id: client.id, name: 'Qatari Riyal', code: 'QAR', symbol: 'QAR', is_base: false, decimal_places: 2, created_by: clientUser.id },
      { client_id: client.id, name: 'Saudi Riyal', code: 'SAR', symbol: 'SAR', is_base: false, decimal_places: 2, created_by: clientUser.id },
      { client_id: client.id, name: 'United States Dollar', code: 'USD', symbol: '$', is_base: false, decimal_places: 2, created_by: clientUser.id }
    ]
  });

  // 12. Company Profile
  await prisma.companyProfile.upsert({
    where: { client_id: client.id },
    update: {},
    create: {
      client_id: client.id,
      company_name: 'Optima',
      cr_number: '2381271-1',
      email: 'info@optima.com',
      phone: '1712 3456',
      mobile: '3456 7890',
      fiscal_year: 'January - December',
      fiscal_start_date: '01',
      fiscal_period: '01 January - 31 December',
      billing_country: 'Bahrain',
      shipment_country: 'Bahrain',
      default_language: 'English',
      time_zone: 'UTC + 3:00',
      date_format: 'dd MMM yyyy - 26 Jan 2026',
      currency_format: '0.000',
      updated_by: clientUser.id
    }
  });

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
