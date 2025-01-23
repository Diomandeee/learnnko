"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useShops } from "@/hooks/use-shops"

interface VisitData {
  area: string
  totalShops: number
  visitedShops: number
  leads: number
}

export function VisitChart() {
  const { shops, loading } = useShops()
  const [data, setData] = useState<VisitData[]>([])

  useEffect(() => {
    if (shops && shops.length > 0) {
      // Group shops by area
      const areaData = shops.reduce((acc, shop) => {
        const area = shop.area || 'Unknown'
        if (!acc[area]) {
          acc[area] = {
            area,
            totalShops: 0,
            visitedShops: 0,
            leads: 0
          }
        }
        
        acc[area].totalShops++
        if (shop.visited) acc[area].visitedShops++
        if (shop.parlor_coffee_leads) acc[area].leads++
        
        return acc
      }, {} as Record<string, VisitData>)

      setData(Object.values(areaData))
    }
  }, [shops])

  if (loading) {
    return <div>Loading chart...</div>
  }

  return (
    <div className="h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="area" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="totalShops" name="Total Shops" fill="#94a3b8" />
          <Bar dataKey="visitedShops" name="Visited" fill="#22c55e" />
          <Bar dataKey="leads" name="Leads" fill="#eab308" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
