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
      "Buf Barista": 4000,
      "Restaurant": 2400,
    },
    {
      month: "Feb",
      "Buf Barista": 3000,
      "Restaurant": 1398,
    },
    {
      month: "Mar",
      "Buf Barista": 2000,
      "Restaurant": 9800,
    },
    {
      month: "Apr",
      "Buf Barista": 2780,
      "Restaurant": 3908,
    },
    {
      month: "May",
      "Buf Barista": 1890,
      "Restaurant": 4800,
    },
    {
      month: "Jun",
      "Buf Barista": 2390,
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
          <Bar dataKey="Buf Barista" fill="#8884d8" />
          <Bar dataKey="Restaurant" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
