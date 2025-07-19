const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Add react-colorful for color picker
if (!packageJson.dependencies['react-colorful']) {
  packageJson.dependencies['react-colorful'] = '^5.6.1';
}

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('Dependencies updated successfully');
