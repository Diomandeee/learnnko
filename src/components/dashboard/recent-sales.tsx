export function RecentSales() {
    return (
      <div className="space-y-8">
        {/* Example recent contacts */}
        <div className="flex items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">John Doe</p>
            <p className="text-sm text-muted-foreground">john@example.com</p>
          </div>
          <div className="ml-auto font-medium">New</div>
        </div>
        <div className="flex items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Alice Smith</p>
            <p className="text-sm text-muted-foreground">alice@example.com</p>
          </div>
          <div className="ml-auto font-medium">Qualified</div>
        </div>
        <div className="flex items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Bob Johnson</p>
            <p className="text-sm text-muted-foreground">bob@example.com</p>
          </div>
          <div className="ml-auto font-medium">Converted</div>
        </div>
        {/* Add more recent contacts as needed */}
      </div>
    );
  }