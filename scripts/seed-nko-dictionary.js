const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedNkoDictionaryCategories() {
  const categories = [
    { name: "Common Phrases", slug: "common-phrases", description: "Everyday expressions and phrases" },
    { name: "Greetings", slug: "greetings", description: "Ways to say hello and goodbye" },
    { name: "Family", slug: "family", description: "Terms for family members and relationships" },
    { name: "Food & Drink", slug: "food-drink", description: "Words related to eating and drinking" },
    { name: "Numbers", slug: "numbers", description: "Counting and numerical expressions" },
    { name: "Time & Date", slug: "time-date", description: "Expressions of time and calendar terms" },
    { name: "Colors", slug: "colors", description: "Names of colors" },
    { name: "Weather", slug: "weather", description: "Weather conditions and climate terms" },
    { name: "Travel", slug: "travel", description: "Words for transportation and navigation" },
    { name: "Professions", slug: "professions", description: "Job titles and occupations" },
    { name: "Animals", slug: "animals", description: "Names of animals and related terms" },
    { name: "Nature", slug: "nature", description: "Words for natural phenomena and environments" },
    { name: "Body", slug: "body", description: "Parts of the body and health terms" },
    { name: "Clothing", slug: "clothing", description: "Garments and accessories" },
    { name: "Directions", slug: "directions", description: "Spatial directions and locations" },
  ];

  console.log('Seeding NKO dictionary categories...');
  for (const category of categories) {
    await prisma.nkoDictionaryCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
  }

  console.log('Dictionary categories seeded successfully!');
}

// Run the seed function
seedNkoDictionaryCategories()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
