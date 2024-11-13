"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

const data = [
  {
    name: "Jan",
    total: 1140,
  },
  {
    name: "Feb",
    total: 1320,
  },
  {
    name: "Mar",
    total: 1180,
  },
  {
    name: "Apr",
    total: 1350,
  },
  {
    name: "May",
    total: 1280,
  },
  {
    name: "Jun",
    total: 1420,
  },
  {
    name: "Jul",
    total: 1380,
  },
  {
    name: "Aug",
    total: 1520,
  },
  {
    name: "Sep",
    total: 1460,
  },
  {
    name: "Oct",
    total: 1640,
  },
  {
    name: "Nov",
    total: 1580,
  },
  {
    name: "Dec",
    total: 1780,
  },
]

export function OverviewChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip />
              <Bar
                dataKey="total"
                fill="currentColor"
                radius={[4, 4, 0, 0]}
                className="fill-primary"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
