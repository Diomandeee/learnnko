"use client";

import Link from "next/link";
import { MobileNav } from "./mobile-nav";
import { UserNav } from "@/components/auth/user-nav";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageCircle, Languages, Archive } from "lucide-react";

export function TopNav() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur-sm px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <MobileNav />
        <Link href="/nko" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <img 
              src="/nko_logo.svg" 
              alt="N'Ko Logo" 
              className="w-5 h-5"
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              N'Ko Hub
            </h1>
            <div className="text-xs text-muted-foreground -mt-1">Learn • Practice • Master</div>
          </div>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-1">
        <Link href="/nko/lessons">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Lessons</span>
          </Button>
        </Link>
        <Link href="/nko/conversation">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span>Practice</span>
          </Button>
        </Link>
        <Link href="/nko/translate">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Languages className="w-4 h-4" />
            <span>Translate</span>
          </Button>
        </Link>
        <Link href="/nko/dictionary">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            <span>Dictionary</span>
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <UserNav />
      </div>
    </div>
  );
}