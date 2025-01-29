interface ResponsiveTableProps {
  children: React.ReactNode
}

export function ResponsiveTable({ children }: ResponsiveTableProps) {
  return (
    <div className="relative w-full overflow-auto">
      <div className="rounded-md border">
        {children}
      </div>
    </div>
  )
}
