// Run this script with: node check-lesson-id.js
const { getMongoDatabaseId } = require('./src/lib/nko/modules/module-definitions');

const lessonIdToCheck = 'alphabet-basics';
const mongoId = getMongoDatabaseId(lessonIdToCheck);

console.log(`Lesson ID: ${lessonIdToCheck}`);
console.log(`MongoDB ID: ${mongoId}`);
console.log(`\nIf your database shows a different ID, you may need to update the getMongoDatabaseId function.`);
