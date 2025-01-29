"use client";

import { Card } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export function ProfitVisualization() {
  const data = [
    {
      month: "Jan",
      "Milk Man": 4000,
      "Restaurant": 2400,
    },
    {
      month: "Feb",
      "Milk Man": 3000,
      "Restaurant": 1398,
    },
    {
      month: "Mar",
      "Milk Man": 2000,
      "Restaurant": 9800,
    },
    {
      month: "Apr",
      "Milk Man": 2780,
      "Restaurant": 3908,
    },
    {
      month: "May",
      "Milk Man": 1890,
      "Restaurant": 4800,
    },
    {
      month: "Jun",
      "Milk Man": 2390,
      "Restaurant": 3800,
    },
  ];

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Milk Man" fill="#8884d8" />
          <Bar dataKey="Restaurant" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
