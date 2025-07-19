const fs = require('fs');
const path = require('path');

// Define paths
const sourcePath = path.join(__dirname, 'src', 'components', 'downloader', 'youtube-downloader-fixed.tsx');
const targetPath = path.join(__dirname, 'src', 'components', 'downloader', 'youtube-downloader.tsx');

// Copy the fixed file to replace the original
fs.copyFile(sourcePath, targetPath, (err) => {
  if (err) {
    console.error('Error updating file:', err);
    return;
  }
  console.log('Successfully updated YouTube downloader component!');
});
