const fs = require('fs');
const path = require('path');

try {
  // Read the schema addon
  const schemaAddon = fs.readFileSync(path.join(__dirname, 'prisma/schema-addon.prisma'), 'utf8');
  
  // Read the main schema
  const mainSchemaPath = path.join(__dirname, 'prisma/schema.prisma');
  const mainSchema = fs.readFileSync(mainSchemaPath, 'utf8');
  
  // Check if the addon is already in the main schema
  if (mainSchema.includes('model NkoLesson')) {
    console.log('Schema already contains the N\'Ko models. Skipping update.');
    process.exit(0);
  }
  
  // Append the addon to the main schema
  const updatedSchema = mainSchema + '\n\n' + schemaAddon;
  
  // Write the updated schema back
  fs.writeFileSync(mainSchemaPath, updatedSchema);
  
  console.log('Schema updated successfully! Run npx prisma generate to update the Prisma client.');
} catch (error) {
  console.error('Error updating schema:', error);
  process.exit(1);
}
