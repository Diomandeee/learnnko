import { useState } from "react"
import { Button } from "@/components/ui/button"
import { QRCodeList } from "./qr-list"
import { QRCodesTable } from "./qr-codes-table"
import { LayoutGrid, Table2 } from "lucide-react"

interface QRViewProps {
  folderId?: string | null
}

export function QRView({ folderId }: QRViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="inline-flex items-center rounded-lg border bg-background p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="px-2"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="px-2"
          >
            <Table2 className="h-4 w-4 mr-2" />
            Table
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <QRCodeList folderId={folderId} />
      ) : (
        <QRCodesTable folderId={folderId} />
      )}
    </div>
  )
}