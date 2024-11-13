// src/app/(app)/qr/page.tsx
"use client"

import { useState } from "react"
import { FolderList } from "@/components/dashboard/qr/folder-list"
import { QRView } from "@/components/dashboard/qr/qr-view"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { PageContainer } from "@/components/layout/page-container"

export default function QRCodesPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  return (
       <PageContainer>

    <div className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">QR Codes</h2>
          <p className="text-muted-foreground">
            Create and manage your dynamic QR codes
          </p>
        </div>
        <Link href="/dashboard/qr/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create QR Code
          </Button>
        </Link>
      </div>

      <div className="flex gap-8">
        <div className="w-64">
          <FolderList
            selectedFolderId={selectedFolderId}
            onFolderSelect={setSelectedFolderId}
          />
        </div>
        <div className="flex-1">
          <QRView folderId={selectedFolderId} />
        </div>
      </div>
    </div>
  </PageContainer>
  )
}