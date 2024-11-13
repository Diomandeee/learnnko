"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface QRAnalyticsProps {
  qrCodeId: string
}

// Mock data - replace with real data fetch
const mockData = [
  { date: "2024-01-01", scans: 45 },
  { date: "2024-01-02", scans: 67 },
  { date: "2024-01-03", scans: 32 },
  { date: "2024-01-04", scans: 89 },
  { date: "2024-01-05", scans: 102 },
  { date: "2024-01-06", scans: 78 },
  { date: "2024-01-07", scans: 56 },
]

export function QRAnalytics({  }: QRAnalyticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
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
              <Line
                type="monotone"
                dataKey="scans"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
