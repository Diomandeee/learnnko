// This utility checks how IDs are generated for the database
const { getMongoDatabaseId } = require('./src/lib/nko/modules/module-definitions');

// Test the lesson ID
const testIds = [
  "alphabet-basics",
  "nko-history",
  "alphabet-vowels"
];

testIds.forEach(id => {
  console.log(`Lesson ID: "${id}" → Database ID: "${getMongoDatabaseId(id)}"`);
});
