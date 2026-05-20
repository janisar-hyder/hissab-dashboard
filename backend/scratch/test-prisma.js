const { PrismaClient } = require('C:\\Users\\janis\\OneDrive\\Desktop\\Clone\\hissab-dashboard\\backend\\node_modules\\@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Testing Prisma client...");
  try {
    // Try to find first inventory item or list fields
    const item = await prisma.inventoryItem.findFirst();
    console.log("First item found:", item);
    
    if (item) {
      console.log("Attempting to update item with id:", item.id);
      const updated = await prisma.inventoryItem.update({
        where: { id: item.id },
        data: {
          name: item.name,
          uom_id: item.uom_id,
          updated_date: new Date()
        }
      });
      console.log("Update successful!", updated);
    } else {
      console.log("No items found to update.");
    }
  } catch (err) {
    console.error("Prisma error during test:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
