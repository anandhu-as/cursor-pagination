import prisma from './prisma.js';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys', 'Food', 'Beauty'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  console.log('Seeding 200,000 products...');

  const TOTAL = 200000;
  const BATCH_SIZE = 5000; // Batch size to optimize database queries

  for (let offset = 0; offset < TOTAL; offset += BATCH_SIZE) {
    const batchCount = Math.min(BATCH_SIZE, TOTAL - offset);

    // Build the bulk array of products
    const data = Array.from({ length: batchCount }, (_, i) => {
      const daysAgo = Math.random() * 365;
      const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      return {
        name: `Product ${offset + i + 1}`,
        category: randomItem(CATEGORIES),
        price: parseFloat((Math.random() * 999 + 1).toFixed(2)),
        createdAt: date,
        updatedAt: date,
      };
    });

    // Bulk insert using one database command
    await prisma.product.createMany({ data });
    console.log(`Inserted ${Math.min(offset + BATCH_SIZE, TOTAL)} / ${TOTAL}`);
  }

  console.log('✅ Done seeding!');
  await prisma.$disconnect();
}

seed().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
