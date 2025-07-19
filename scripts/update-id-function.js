// Script to check and update the getMongoDatabaseId function
const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'lib', 'nko', 'modules', 'module-definitions.ts');

// Check if the file exists
if (!fs.existsSync(filePath)) {
  console.error('Module definitions file not found at:', filePath);
  process.exit(1);
}

// Read the file
const fileContent = fs.readFileSync(filePath, 'utf8');

// Check if the function exists
const functionExists = fileContent.includes('function getMongoDatabaseId');

if (functionExists) {
  console.log('Found getMongoDatabaseId function. Updating it...');
  
  // The updated function
  const updatedFunction = `
// Helper function to convert string ID to MongoDB ObjectID
export function getMongoDatabaseId(stringId: string): string {
  // Generate a timestamp portion (first 8 chars)
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  
  // Generate a hash from the string ID
  let hash = 0;
  for (let i = 0; i < stringId.length; i++) {
    const char = stringId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Create machine id portion (6 chars)
  const machineId = Math.abs(hash).toString(16).slice(0, 6).padStart(6, '0');
  
  // Create counter portion (10 chars)
  const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
  const randomPart = Math.floor(Math.random() * 16777216).toString(16).padStart(4, '0');
  
  // Full 24-char MongoDB ObjectID
  return timestamp + machineId + counter + randomPart;
}`;

  // Replace the existing function with the updated one
  const regex = /\/\/\s*Helper function to convert.*?function getMongoDatabaseId[\s\S]*?\}/g;
  
  if (regex.test(fileContent)) {
    const newContent = fileContent.replace(regex, updatedFunction);
    fs.writeFileSync(filePath, newContent);
    console.log('Updated getMongoDatabaseId function successfully!');
  } else {
    console.log('Could not find the exact function pattern. Adding the function at the end...');
    fs.writeFileSync(filePath, fileContent + '\n' + updatedFunction);
    console.log('Added getMongoDatabaseId function at the end of the file.');
  }
} else {
  console.log('getMongoDatabaseId function not found. Adding it...');
  fs.writeFileSync(filePath, fileContent + `
// Helper function to convert string ID to MongoDB ObjectID
export function getMongoDatabaseId(stringId: string): string {
  // Generate a timestamp portion (first 8 chars)
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  
  // Generate a hash from the string ID
  let hash = 0;
  for (let i = 0; i < stringId.length; i++) {
    const char = stringId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Create machine id portion (6 chars)
  const machineId = Math.abs(hash).toString(16).slice(0, 6).padStart(6, '0');
  
  // Create counter portion (10 chars)
  const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
  const randomPart = Math.floor(Math.random() * 16777216).toString(16).padStart(4, '0');
  
  // Full 24-char MongoDB ObjectID
  return timestamp + machineId + counter + randomPart;
}`);
  console.log('Added getMongoDatabaseId function to the file.');
}

console.log('Done updating the module-definitions.ts file.');
