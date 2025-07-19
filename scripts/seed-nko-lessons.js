const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Import the seed function - need to use require syntax for this script
require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-typescript'],
  plugins: [
    ['module-resolver', {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }]
  ],
  extensions: ['.js', '.ts', '.tsx'],
});

const { seedNkoLessons } = require('./src/lib/nko/seed/seed-lessons');

async function main() {
  console.log('Starting N\'Ko lesson seeding...');
  await seedNkoLessons();
  console.log('Seeding complete!');
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
