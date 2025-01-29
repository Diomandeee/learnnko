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
