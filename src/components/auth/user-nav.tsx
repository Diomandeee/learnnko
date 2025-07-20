"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogOut, Settings, BookOpen, Trophy, Activity, Target } from "lucide-react"
import Link from "next/link"

export function UserNav() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 animate-pulse bg-muted rounded-full" />
        <div className="hidden sm:block">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/auth/login" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Sign In</span>
          </Link>
        </Button>
        <Button size="sm" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Link href="/auth/register" className="flex items-center gap-2">
            <span className="hidden sm:inline">Sign Up</span>
          </Link>
        </Button>
      </div>
    )
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-auto px-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage 
                src={session.user?.avatar || ""} 
                alt={session.user?.name || ""} 
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium leading-none">
                {session.user?.name || "N'Ko Learner"}
              </div>
              <div className="text-xs leading-none text-muted-foreground">
                {session.user?.email}
              </div>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user?.name || "N'Ko Learner"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user?.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer p-3">
          <Link href="/profile" className="flex items-center gap-3">
            <User className="h-4 w-4" />
            <div>
              <span className="font-medium">Profile</span>
              <div className="text-xs text-muted-foreground">View your learning progress</div>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer p-3">
          <Link href="/nko/lessons" className="flex items-center gap-3">
            <BookOpen className="h-4 w-4" />
            <div>
              <span className="font-medium">My Lessons</span>
              <div className="text-xs text-muted-foreground">Continue learning</div>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer p-3">
          <Link href="/profile?tab=achievements" className="flex items-center gap-3">
            <Trophy className="h-4 w-4" />
            <div>
              <span className="font-medium">Achievements</span>
              <div className="text-xs text-muted-foreground">View your badges</div>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer p-3">
          <Link href="/profile?tab=activity" className="flex items-center gap-3">
            <Activity className="h-4 w-4" />
            <div>
              <span className="font-medium">Activity</span>
              <div className="text-xs text-muted-foreground">Learning history</div>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer p-3">
          <Link href="/settings" className="flex items-center gap-3">
            <Settings className="h-4 w-4" />
            <div>
              <span className="font-medium">Settings</span>
              <div className="text-xs text-muted-foreground">Account preferences</div>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer p-3" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-3" />
          <div>
            <span className="font-medium">Sign Out</span>
            <div className="text-xs text-muted-foreground">End your session</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 