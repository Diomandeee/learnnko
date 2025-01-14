"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseAllocation } from "./expense-allocation";
import { SensitivityAnalysis } from "./sensitivity-analysis";
import { ScenarioComparison } from "./scenario-comparison";
import { ProfitVisualization } from "./profit-visualization";

export function ProfitCalculator() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expenses">Expense Allocation</TabsTrigger>
          <TabsTrigger value="sensitivity">Sensitivity Analysis</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Comparison</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expense Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseAllocation />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensitivity">
          <Card>
            <CardHeader>
              <CardTitle>Sensitivity Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <SensitivityAnalysis />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ScenarioComparison />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualization">
          <Card>
            <CardHeader>
              <CardTitle>Profit Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfitVisualization />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
