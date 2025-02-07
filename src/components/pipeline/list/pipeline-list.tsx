"use client"

import { useState } from "react"
import { CoffeeShop, Stage } from "@prisma/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StageCell } from "../../coffee-shops/table/stage-cell"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface PipelineListProps {
  shops: CoffeeShop[]
}

export function PipelineList({ shops }: PipelineListProps) {
  const [loading, setLoading] = useState(false)

  const handleStageChange = async (shopId: string, newStage: Stage) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/coffee-shops/${shopId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      })

      if (!response.ok) throw new Error('Failed to update stage')
      window.location.reload()
    } catch (error) {
      console.error('Failed to update stage:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Deal</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Area</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shops.map((shop) => {
            const estimatedValue = shop.volume 
              ? (parseFloat(shop.volume.toString()) * 52 * 18) 
              : 0

            return (
              <TableRow key={shop.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/coffee-shops/${shop.id}`}
                    className="font-medium hover:underline"
                  >
                    {shop.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <StageCell
                    stage={shop.stage}
                    onUpdate={(stage) => handleStageChange(shop.id, stage)}
                    disabled={loading}
                  />
                </TableCell>
                <TableCell>${estimatedValue.toLocaleString()}</TableCell>
                <TableCell>{shop.area || "-"}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(shop.updatedAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  {shop.isPartner && (
                    <Badge variant="success">Partner</Badge>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
