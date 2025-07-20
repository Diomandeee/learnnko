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
  Settings,
  Award,
  Activity,
  Zap,
  CheckCircle,
  PlayCircle,
  User
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
    date: "2025-07-15",
    rarity: "common"
  },
  {
    id: 2,
    name: "Script Master",
    description: "Master all N'Ko vowels",
    icon: "✍️",
    unlocked: true,
    date: "2025-07-17",
    rarity: "rare"
  },
  {
    id: 3,
    name: "Streak Champion",
    description: "Maintain a 7-day learning streak",
    icon: "🔥",
    unlocked: false,
    date: null,
    rarity: "epic"
  },
  {
    id: 4,
    name: "Cultural Explorer",
    description: "Complete 5 cultural context lessons",
    icon: "🌍",
    unlocked: false,
    date: null,
    rarity: "legendary"
  }
]

const mockRecentActivity = [
  {
    type: "lesson_completed",
    title: "Introduction to N'Ko Script",
    date: "2025-07-19",
    score: 95,
    icon: CheckCircle
  },
  {
    type: "achievement_unlocked",
    title: "Script Master",
    date: "2025-07-17",
    score: null,
    icon: Trophy
  },
  {
    type: "lesson_completed",
    title: "N'Ko Vowels and Pronunciation",
    date: "2025-07-16",
    score: 87,
    icon: CheckCircle
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
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to view your profile and learning progress.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/register">Create Account</Link>
            </Button>
          </div>
        </div>
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
    <div className="space-y-8">
      {/* Enhanced Profile Header */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-950 dark:via-purple-950 dark:to-indigo-950 border-0 shadow-lg">
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-800 shadow-lg">
                <AvatarImage src={session.user?.avatar || ""} alt={session.user?.name || ""} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {session.user?.name || "N'Ko Learner"}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-4">{session.user?.email}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1">
                  <Zap className="w-3 h-3 mr-1" />
                  {mockProgress.currentLevel}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">{mockProgress.currentStreak}</span> day streak
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{mockProgress.completedLessons}</span> lessons completed
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/nko/lessons">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Continue Learning
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockProgress.completedLessons}</p>
                <p className="text-sm text-muted-foreground">Lessons Completed</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 dark:text-green-400">+2 this week</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.floor(mockProgress.totalTimeSpent / 60)}h {mockProgress.totalTimeSpent % 60}m</p>
                <p className="text-sm text-muted-foreground">Time Studied</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-green-600 dark:text-green-400">+45min today</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockProgress.currentStreak}</p>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-xs text-orange-600 dark:text-orange-400">Best: {mockProgress.longestStreak} days</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockProgress.progressToNextLevel}%</p>
                <p className="text-sm text-muted-foreground">Level Progress</p>
                <div className="flex items-center gap-1 mt-1">
                  <Target className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-purple-600 dark:text-purple-400">Next: {mockProgress.nextLevel}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Goals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Level Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Level Progress
                </CardTitle>
                <CardDescription>
                  Your journey from {mockProgress.currentLevel} to {mockProgress.nextLevel}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>{mockProgress.currentLevel}</span>
                  <span>{mockProgress.nextLevel}</span>
                </div>
                <Progress value={mockProgress.progressToNextLevel} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{mockProgress.completedLessons} lessons completed</span>
                  <span>{mockProgress.totalLessons - mockProgress.completedLessons} remaining</span>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Weekly Goal
                </CardTitle>
                <CardDescription>
                  Complete {mockProgress.weeklyGoal} lessons this week
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{mockProgress.weeklyProgress}/{mockProgress.weeklyGoal}</span>
                </div>
                <Progress value={(mockProgress.weeklyProgress / mockProgress.weeklyGoal) * 100} className="h-3" />
                <div className="text-sm text-muted-foreground">
                  {mockProgress.weeklyGoal - mockProgress.weeklyProgress} lessons left this week
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockAchievements.map((achievement) => (
              <Card key={achievement.id} className={`transition-all duration-300 ${achievement.unlocked ? 'hover:shadow-lg' : 'opacity-60'}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{achievement.name}</h3>
                        {achievement.unlocked && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Unlocked
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                      {achievement.unlocked && achievement.date && (
                        <p className="text-xs text-muted-foreground">
                          Unlocked on {new Date(achievement.date).toLocaleDateString()}
                        </p>
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
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest learning activities and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <activity.icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                    {activity.score && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {activity.score}%
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
                <Target className="w-5 h-5" />
                Learning Goals
              </CardTitle>
              <CardDescription>
                Set and track your personal learning objectives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Current Goals</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Complete 10 lessons</p>
                        <p className="text-sm text-muted-foreground">8/10 completed</p>
                      </div>
                      <Progress value={80} className="w-16 h-2" />
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Study 5 hours this week</p>
                        <p className="text-sm text-muted-foreground">4h 30m completed</p>
                      </div>
                      <Progress value={90} className="w-16 h-2" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Suggested Goals</h3>
                  <div className="space-y-3">
                    <div className="p-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                      <p className="font-medium">Maintain 7-day streak</p>
                      <p className="text-sm text-muted-foreground">Current: 5 days</p>
                    </div>
                    <div className="p-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                      <p className="font-medium">Master 50 vocabulary words</p>
                      <p className="text-sm text-muted-foreground">Current: 32 words</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 