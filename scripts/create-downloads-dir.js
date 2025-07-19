const fs = require('fs');
const path = require('path');

// Create downloads directory
const downloadsDir = path.join(process.cwd(), 'downloads');

if (!fs.existsSync(downloadsDir)) {
  console.log('Creating downloads directory...');
  fs.mkdirSync(downloadsDir, { recursive: true });
  console.log('Downloads directory created at:', downloadsDir);
} else {
  console.log('Downloads directory already exists at:', downloadsDir);
}
