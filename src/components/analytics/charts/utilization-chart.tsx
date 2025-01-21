"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffUtilization } from "@/types/analytics";

interface UtilizationChartProps {
  data: StaffUtilization[];
}

export function UtilizationChart({ data }: UtilizationChartProps) {
  const [metric, setMetric] = useState<"utilizationRate" | "overtimeHours" | "totalCost">("utilizationRate");

  const chartData = data.map(item => ({
    name: item.staffName,
    value: item[metric],
    fill: getBarColor(item[metric], metric)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Utilization</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function getBarColor(value: number, metric: string): string {
  switch (metric) {
    case "utilizationRate":
      if (value < 70) return "#ef4444";
      if (value < 90) return "#f59e0b";
      return "#22c55e";

    case "overtimeHours":
      if (value > 10) return "#ef4444";
      if (value > 5) return "#f59e0b";
      return "#22c55e";

    case "totalCost":
      return "#3b82f6";

    default:
      return "#6b7280";
  }
}
