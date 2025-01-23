"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useVisits } from "@/hooks/use-visits"
import { Visit, CoffeeShop } from "@prisma/client"

type VisitWithShop = Visit & {
  coffeeShop: CoffeeShop
}

export function VisitTable() {
  const { visits, loading } = useVisits()

  if (loading) return <div>Loading visits...</div>

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Coffee Shop</TableHead>
            <TableHead>Manager Present</TableHead>
            <TableHead>Samples</TableHead>
            <TableHead>Next Visit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visits?.map((visit: VisitWithShop) => (
            <TableRow key={visit.id}>
              <TableCell>
                {format(new Date(visit.date), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>{visit.coffeeShop.title}</TableCell>
              <TableCell>
                {visit.managerPresent ? (
                  <Badge variant="success">Yes</Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
                )}
              </TableCell>
              <TableCell>
                {visit.samplesDropped ? (
                  <Badge variant="success">Dropped</Badge>
                ) : (
                  <Badge variant="secondary">None</Badge>
                )}
              </TableCell>
              <TableCell>
                {visit.nextVisitDate ? (
                  format(new Date(visit.nextVisitDate), 'MMM d, yyyy')
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                <Badge>
                  Visit #{visit.visitNumber}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
