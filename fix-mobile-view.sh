#!/bin/bash

# First, let's modify the table container div to be hidden on mobile
sed -i '' 's/<div className="border rounded-md overflow-x-auto">/<div className="hidden md:block border rounded-md overflow-x-auto">/g' src/components/coffee-shops-table.tsx

# Add responsive classes to the MobileCardView component
sed -i '' 's/<MobileCardView/<MobileCardView className="md:hidden"/g' src/components/coffee-shops-table.tsx

# Ensure the search/filter controls are properly responsive
sed -i '' 's/className="flex flex-col gap-4 md:hidden"/className="flex flex-col gap-4 md:hidden w-full"/g' src/components/coffee-shops-table.tsx

# Update the style section to handle mobile better
cat >> src/components/coffee-shops-table.tsx << 'EOL'
     <style jsx>{`
       @media (max-width: 768px) {
         .overflow-x-auto {
           -webkit-overflow-scrolling: touch;
         }
         
         .table {
           min-width: 100%;
         }
       }
       
       @media (min-width: 769px) {
         .overflow-x-auto {
           max-width: 100%;
         }

         .table {
           min-width: 100%;
           width: max-content;
         }

         th, td {
           white-space: nowrap;
           padding: 0.75rem 1rem;
         }

         th:first-child,
         td:first-child {
           position: sticky;
           left: 0;
           background: white;
           z-index: 1;
         }
       }
     `}</style>
EOL

chmod +x fix-mobile-view.sh
