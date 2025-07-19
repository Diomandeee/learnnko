"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Calendar, 
  Clock, 
  Flame,
  Star,
  TrendingUp,
  Users,
  Settings
} from "lucide-react"
import Link from "next/link"

// Mock data - in real app, this would come from API
const mockProgress = {
  totalLessons: 53,
  completedLessons: 8,
  currentStreak: 5,
  longestStreak: 12,
  totalTimeSpent: 240, // minutes
  currentLevel: "Beginner",
  nextLevel: "Intermediate",
  progressToNextLevel: 65,
  weeklyGoal: 5, // lessons per week
  weeklyProgress: 3
}

const mockAchievements = [
  {
    id: 1,
    name: "First Steps",
    description: "Complete your first N'Ko lesson",
    icon: "🎯",
    unlocked: true,
    date: "2025-07-15"
  },
  {
    id: 2,
    name: "Script Master",
    description: "Master all N'Ko vowels",
    icon: "✍️",
    unlocked: true,
    date: "2025-07-17"
  },
  {
    id: 3,
    name: "Streak Champion",
    description: "Maintain a 7-day learning streak",
    icon: "🔥",
    unlocked: false,
    date: null
  },
  {
    id: 4,
    name: "Cultural Explorer",
    description: "Complete 5 cultural context lessons",
    icon: "🌍",
    unlocked: false,
    date: null
  }
]

const mockRecentActivity = [
  {
    type: "lesson_completed",
    title: "Introduction to N'Ko Script",
    date: "2025-07-19",
    score: 95
  },
  {
    type: "achievement_unlocked",
    title: "Script Master",
    date: "2025-07-17",
    score: null
  },
  {
    type: "lesson_completed",
    title: "N'Ko Vowels and Pronunciation",
    date: "2025-07-16",
    score: 87
  }
]

export function ProfileDashboard() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
        <p className="text-muted-foreground mb-6">
          You need to be signed in to view your profile and learning progress.
        </p>
        <Button asChild>
          <Link href="/auth/login">Sign In</Link>
        </Button>
      </div>
    )
  }

  const userInitials = session.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : session.user?.email?.[0]?.toUpperCase() || "U"

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session.user?.avatar || ""} alt={session.user?.name || ""} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{session.user?.name || "N'Ko Learner"}</h1>
              <p className="text-muted-foreground">{session.user?.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {mockProgress.currentLevel}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Flame className="h-4 w-4 text-orange-500" />
                  {mockProgress.currentStreak} day streak
                </div>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{mockProgress.completedLessons}</p>
                <p className="text-sm text-muted-foreground">Lessons Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{Math.floor(mockProgress.totalTimeSpent / 60)}h {mockProgress.totalTimeSpent % 60}m</p>
                <p className="text-sm text-muted-foreground">Time Studied</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{mockProgress.currentStreak}</p>
                <p className="text-sm text-muted-foreground">Current Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{mockAchievements.filter(a => a.unlocked).length}</p>
                <p className="text-sm text-muted-foreground">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Learning Progress
                </CardTitle>
                <CardDescription>
                  Your journey through the N'Ko curriculum
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {mockProgress.completedLessons}/{mockProgress.totalLessons} lessons
                    </span>
                  </div>
                  <Progress 
                    value={(mockProgress.completedLessons / mockProgress.totalLessons) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Progress to {mockProgress.nextLevel}</span>
                    <span className="text-sm text-muted-foreground">{mockProgress.progressToNextLevel}%</span>
                  </div>
                  <Progress value={mockProgress.progressToNextLevel} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Weekly Goal</span>
                    <span className="text-sm text-muted-foreground">
                      {mockProgress.weeklyProgress}/{mockProgress.weeklyGoal} lessons
                    </span>
                  </div>
                  <Progress 
                    value={(mockProgress.weeklyProgress / mockProgress.weeklyGoal) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Study Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Study Streak
                </CardTitle>
                <CardDescription>
                  Keep up the great work!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-2">
                    {mockProgress.currentStreak}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    days in a row
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Longest streak: {mockProgress.longestStreak} days
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    Come back tomorrow to extend your streak!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockAchievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.unlocked ? "border-green-200 bg-green-50" : "border-muted"}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`text-2xl ${achievement.unlocked ? "" : "grayscale opacity-50"}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      {achievement.unlocked ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Unlocked {achievement.date}
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest learning milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-0">
                    <div className="h-2 w-2 bg-blue-600 rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.date}</p>
                    </div>
                    {activity.score && (
                      <Badge variant="secondary">
                        {activity.score}% score
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Learning Goals
              </CardTitle>
              <CardDescription>
                Set and track your personalized learning objectives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Daily Goal</h4>
                <p className="text-sm text-muted-foreground">
                  Study for 15 minutes each day
                </p>
                <Progress value={80} className="mt-2 h-2" />
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Weekly Goal</h4>
                <p className="text-sm text-muted-foreground">
                  Complete {mockProgress.weeklyGoal} lessons this week
                </p>
                <Progress 
                  value={(mockProgress.weeklyProgress / mockProgress.weeklyGoal) * 100} 
                  className="mt-2 h-2" 
                />
              </div>

              <Button className="w-full" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Customize Goals
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 