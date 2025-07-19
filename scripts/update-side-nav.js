const fs = require('fs');
const path = require('path');

// Path to the SideNav component
const sideNavPath = path.join(__dirname, 'src', 'components', 'dashboard', 'navigation', 'side-nav.tsx');

// Read the current component file
fs.readFile(sideNavPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  
  // Add the Download icon to imports
  let updatedContent = data.replace(
    /import \{\s*HomeIcon,\s*QrCode,\s*Settings,\s*FileText,\s*MenuIcon,\s*XIcon\s*\} from "lucide-react";/,
    'import { HomeIcon, QrCode, Settings, FileText, Download, MenuIcon, XIcon } from "lucide-react";'
  );
  
  // Add the downloader to the navigation items
  const navigationItems = updatedContent.match(/const navigation = \[\s*{[\s\S]*?}\s*\];/);
  
  if (navigationItems) {
    const navigationContent = navigationItems[0];
    const lastItemIndex = navigationContent.lastIndexOf('},');
    
    if (lastItemIndex !== -1) {
      const downloaderItem = `
    {
      title: "Downloader",
      href: "/dashboard/downloader",
      icon: <Download className="h-5 w-5" />,
    },`;
      
      updatedContent = updatedContent.replace(
        navigationContent,
        navigationContent.slice(0, lastItemIndex + 2) + downloaderItem + navigationContent.slice(lastItemIndex + 2)
      );
    }
  }
  
  // Write the updated file
  fs.writeFile(sideNavPath, updatedContent, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error('Error writing file:', writeErr);
      return;
    }
    console.log('Successfully updated SideNav component with Downloader link!');
  });
});
