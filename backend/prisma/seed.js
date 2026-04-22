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
  await prisma.inventoryItem.deleteMany({ where: { client_id: client.id } });
  await prisma.customerContact.deleteMany({ where: { customer: { client_id: client.id } } });
  await prisma.customer.deleteMany({ where: { client_id: client.id } });
  await prisma.purchaseVendorContact.deleteMany({ where: { vendor: { client_id: client.id } } });
  await prisma.purchaseVendor.deleteMany({ where: { client_id: client.id } });
  await prisma.salesPerson.deleteMany({ where: { client_id: client.id } });
  await prisma.salesPartner.deleteMany({ where: { client_id: client.id } });
  await prisma.currency.deleteMany({ where: { client_id: client.id } });
  await prisma.chartOfAccount.deleteMany({ where: { client_id: client.id } });
  await prisma.inventoryCategory.deleteMany({ where: { client_id: client.id } });
  await prisma.inventorySubCategory.deleteMany({ where: { client_id: client.id } });
  await prisma.inventoryUnitOfMeasure.deleteMany({ where: { client_id: client.id } });
  await prisma.vatRate.deleteMany({ where: { client_id: client.id } });

  // 7. Chart of Accounts
  await prisma.chartOfAccount.createMany({
    data: [
      { client_id: client.id, name: 'Sales', type: 'Income', created_by: clientUser.id },
      { client_id: client.id, name: 'Cost of Goods Sold', type: 'Cost of Goods Sold', created_by: clientUser.id },
      { client_id: client.id, name: 'Inventory Asset', type: 'Stock', created_by: clientUser.id }
    ]
  });

  // 7. Inventory Categories & Units
  const category1 = await prisma.inventoryCategory.create({
    data: { client_id: client.id, name: 'AC Units', status: 'Active', created_by: clientUser.id }
  });
  
  const category2 = await prisma.inventoryCategory.create({
    data: { client_id: client.id, name: 'Consumables', status: 'Active', created_by: clientUser.id }
  });

  const unitNos = await prisma.inventoryUnitOfMeasure.create({
    data: { client_id: client.id, name: 'Nos', status: 'Active', created_by: clientUser.id }
  });

  const unitMeters = await prisma.inventoryUnitOfMeasure.create({
    data: { client_id: client.id, name: 'Meters', status: 'Active', created_by: clientUser.id }
  });

  const unitKg = await prisma.inventoryUnitOfMeasure.create({
    data: { client_id: client.id, name: 'Kg', status: 'Active', created_by: clientUser.id }
  });

  const unitCbm = await prisma.inventoryUnitOfMeasure.create({
    data: { client_id: client.id, name: 'CBM', status: 'Active', created_by: clientUser.id }
  });

  const subCategory1 = await prisma.inventorySubCategory.create({
    data: { client_id: client.id, name: 'Wall Mounted', category_id: category1.id, status: 'Active', created_by: clientUser.id }
  });

  const salesAccount = await prisma.chartOfAccount.findFirst({ where: { client_id: client.id, name: 'Sales' } });
  const cogsAccount = await prisma.chartOfAccount.findFirst({ where: { client_id: client.id, name: 'Cost of Goods Sold' } });
  const stockAccount = await prisma.chartOfAccount.findFirst({ where: { client_id: client.id, name: 'Inventory Asset' } });

  // 12. Purchase Vendors & Contacts (Need to fetch vendor before item for vendor_id)
  const bhd = await prisma.currency.findFirst({ where: { client_id: client.id, code: 'BHD' } });
  const usd = await prisma.currency.findFirst({ where: { client_id: client.id, code: 'USD' } });
  const gbp = await prisma.currency.findFirst({ where: { client_id: client.id, code: 'GBP' } });

  const vendor1 = await prisma.purchaseVendor.create({
    data: {
      client_id: client.id,
      name: 'Gulf HVAC Supplies',
      type: 'Business',
      email: 'sales@gulfhvac.com',
      phone: '+973 17111111',
      currency_id: bhd?.id,
      status: 'Active',
      created_by: clientUser.id,
      contacts: {
        create: [
          {
            first_name: 'Ali',
            last_name: 'Al-Mansoori',
            email: 'ali@gulfhvac.com',
            phone: '+973 33111111',
            designation: 'Sales Manager',
            created_by: clientUser.id
          }
        ]
      }
    }
  });

  // 7.5 Inventory Items
  await prisma.inventoryItem.createMany({
    data: [
      {
        client_id: client.id,
        item_code: 'FULL-001',
        name: 'Premium Air Purifier AC',
        sku: 'PREM-AC-100',
        description: 'A comprehensive product with all details populated',
        uom_id: unitNos.id,
        category_id: category1.id,
        sub_category_id: subCategory1.id,
        sales_rate: 450.000,
        vat_preference: 'Taxable',
        sales_account_id: salesAccount?.id,
        sales_description: 'Sales of Premium AC Units',
        purchase_cost: 320.000,
        reorder_point: 5,
        purchase_account_id: cogsAccount?.id,
        purchase_description: 'Purchase of Premium AC Units',
        inventory_account_id: stockAccount?.id,
        stock_in_hand: 15.000,
        status: 'Active',
        warranty_period: '2 Years',
        shelf_life: '10 Years',
        vendor_id: vendor1.id,
        weight_per_unit: 45.500,
        weight_uom_id: unitKg.id,
        valuation_method: 'FIFO',
        volume_per_unit: 1.500,
        volume_uom_id: unitCbm.id,
        inventory_description: 'Store carefully, avoid moisture',
        created_by: clientUser.id
      },
      {
        client_id: client.id,
        item_code: 'AC-001',
        name: 'Split AC 1.5 Ton',
        uom_id: unitNos.id,
        category_id: category1.id,
        sales_rate: 250.000,
        purchase_cost: 180.000,
        status: 'Active',
        created_by: clientUser.id
      },
      {
        client_id: client.id,
        item_code: 'CBL-001',
        name: 'Copper Cable 4mm',
        uom_id: unitMeters.id,
        category_id: category2.id,
        sales_rate: 1.500,
        purchase_cost: 1.000,
        status: 'Active',
        created_by: clientUser.id
      }
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


  await prisma.purchaseVendor.create({
    data: {
      client_id: client.id,
      name: 'Global Electronics',
      type: 'Business',
      email: 'info@globalelec.com',
      phone: '+1 555-0199',
      currency_id: usd?.id,
      status: 'Active',
      created_by: clientUser.id,
      contacts: {
        create: [
          {
            first_name: 'John',
            last_name: 'Doe',
            email: 'j.doe@globalelec.com',
            phone: '+1 555-0200',
            designation: 'Regional Manager',
            created_by: clientUser.id
          }
        ]
      }
    }
  });

  await prisma.purchaseVendor.create({
    data: {
      client_id: client.id,
      name: 'Industrial Pumps Ltd',
      type: 'Business',
      email: 'support@indpumps.co.uk',
      phone: '+44 20 7946 0958',
      currency_id: gbp?.id,
      status: 'Active',
      created_by: clientUser.id,
      contacts: {
        create: [
          {
            first_name: 'Robert',
            last_name: 'Brown',
            email: 'r.brown@indpumps.co.uk',
            phone: '+44 20 7946 0960',
            designation: 'Service Manager',
            created_by: clientUser.id
          }
        ]
      }
    }
  });

  // 12.5 Customers & Contacts
  await prisma.customer.create({
    data: {
      client_id: client.id,
      name: 'Alpha Retailers',
      type: 'Business',
      email: 'contact@alpharetail.com',
      phone: '+973 17222222',
      currency_id: bhd?.id,
      is_active: true,
      created_by: clientUser.id,
      contacts: {
        create: [
          {
            first_name: 'Sara',
            last_name: 'Salman',
            email: 'sara@alpharetail.com',
            phone: '+973 33222222',
            designation: 'Procurement Officer',
            created_by: clientUser.id
          }
        ]
      }
    }
  });

  await prisma.customer.create({
    data: {
      client_id: client.id,
      name: 'Beta Tech Solutions',
      type: 'Business',
      email: 'billing@betatech.com',
      phone: '+1 800-123-4567',
      currency_id: usd?.id,
      is_active: true,
      created_by: clientUser.id,
      contacts: {
        create: [
          {
            first_name: 'Michael',
            last_name: 'Chang',
            email: 'm.chang@betatech.com',
            phone: '+1 800-123-4568',
            designation: 'Director',
            created_by: clientUser.id
          }
        ]
      }
    }
  });

  // 13. VAT Rates
  await prisma.vatRate.createMany({
    data: [
      { client_id: client.id, name: 'Standard Rate', rate: 5.00, status: 'Active', created_by: clientUser.id },
      { client_id: client.id, name: 'Zero Rated', rate: 0.00, status: 'Active', created_by: clientUser.id },
      { client_id: client.id, name: 'Exempt', rate: 0.00, status: 'Active', created_by: clientUser.id },
      { client_id: client.id, name: 'Out of Scope', rate: 0.00, status: 'Active', created_by: clientUser.id }
    ]
  });

  // 14. Company Profile
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
