"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Clock, Star, BookMarked } from "lucide-react"

export function RecentActivity() {
  const activities = [
    {
      type: "lesson",
      title: "Consonants Practice",
      time: "2 hours ago",
      icon: BookOpen,
    },
    {
      type: "word",
      title: "ߛߏߡߐ߭ (person)",
      time: "Yesterday",
      icon: Star,
    },
    {
      type: "reading",
      title: "Basic Greetings",
      time: "2 days ago",
      icon: BookMarked,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Your recent N'Ko learning activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <activity.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">{activity.title}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
