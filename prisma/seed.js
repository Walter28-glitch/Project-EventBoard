// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = ['Tech Talk', 'Workshop', 'Music', 'Sports'];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const venues = [
    { name: 'Main Hall', address: '123 Campus Ave', capacity: 200 },
    { name: 'Room 201', address: 'Building B', capacity: 40 },
  ];
  for (const v of venues) {
    await prisma.venue.upsert({
      where: { name: v.name },
      update: {},
      create: v,
    });
  }

  console.log('Seeded categories and venues');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());