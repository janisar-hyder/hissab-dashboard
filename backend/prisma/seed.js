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
  const clientAdminRole = await prisma.clientRole.create({
    data: {
      client_id: client.id,
      name: 'Client Admin',
      status: 'Active'
    }
  });

  // 5. Client User
  const clientUser = await prisma.clientUser.create({
    data: {
      client_id: client.id,
      name: 'Test Client Admin',
      email: 'admin@testcorp.com',
      password_hash: 'Haha-1234',
      role_id: clientAdminRole.id,
      status: 'Active'
    }
  });

  // 6. Chart of Accounts
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
