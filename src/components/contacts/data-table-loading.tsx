// src/components/contacts/data-table-loading.tsx
export function DataTableLoading() {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-[250px] animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-[200px] animate-pulse rounded-md bg-muted" />
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-4 rounded-md border p-4"
          >
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-[250px] animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-[200px] animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }