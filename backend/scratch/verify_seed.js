const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  try {
    const vendors = await prisma.purchaseVendor.findMany({
      include: {
        contacts: true,
        currency: true
      }
    });

    console.log(`Total Vendors: ${vendors.length}`);
    vendors.forEach(v => {
      console.log(`- Vendor: ${v.company_name} (${v.currency.code})`);
      console.log(`  Contacts: ${v.contacts.length}`);
    });

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
