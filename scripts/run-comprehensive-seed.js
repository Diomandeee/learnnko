const { seedComprehensiveLessons } = require('./seed-comprehensive-lessons');

async function runSeed() {
  console.log('🚀 Starting N\'Ko comprehensive lesson seeding...');
  console.log('');
  
  try {
    await seedComprehensiveLessons();
    console.log('');
    console.log('🎉 SUCCESS: All comprehensive lessons have been seeded!');
    console.log('');
    console.log('📋 What was created:');
    console.log('   ✅ Complete Introduction to N\'Ko Script (45 min)');
    console.log('   ✅ Mastering N\'Ko Vowels (50 min)');
    console.log('   ✅ Comprehensive content with cultural context');
    console.log('   ✅ Interactive exercises and quizzes');
    console.log('   ✅ Audio pronunciation guides');
    console.log('   ✅ Progressive learning structure');
    console.log('');
    console.log('🎯 Ready for production use!');
    
  } catch (error) {
    console.error('');
    console.error('❌ FAILED: Error during seeding process');
    console.error('');
    console.error('Error details:', error);
    console.error('');
    console.error('💡 Troubleshooting tips:');
    console.error('   1. Ensure MongoDB is running');
    console.error('   2. Check DATABASE_URL in .env file');
    console.error('   3. Verify Prisma schema is up to date');
    console.error('   4. Run: npx prisma generate');
    
    process.exit(1);
  }
}

// Run the seeding
runSeed(); 