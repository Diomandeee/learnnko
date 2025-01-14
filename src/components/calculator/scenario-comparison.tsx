"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ScenarioComparison() {
  const scenarios = [
    {
      id: 1,
      name: "Base Scenario",
      revenue: 10000,
      expenses: 7000,
      profit: 3000,
    },
    {
      id: 2,
      name: "Optimistic Scenario",
      revenue: 15000,
      expenses: 8000,
      profit: 7000,
    },
    {
      id: 3,
      name: "Conservative Scenario",
      revenue: 8000,
      expenses: 6000,
      profit: 2000,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button>Save Current Scenario</Button>
      </div>
      
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Scenario</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Expenses</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scenarios.map((scenario) => (
              <TableRow key={scenario.id}>
                <TableCell>{scenario.name}</TableCell>
                <TableCell className="text-right">
                  ${scenario.revenue.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  ${scenario.expenses.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  ${scenario.profit.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Load</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
