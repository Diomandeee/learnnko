"use client";

import Link from "next/link";
import { MobileNav } from "./mobile-nav";
import { UserNav } from "@/components/auth/user-nav";

export function TopNav() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <MobileNav />
        <Link href="/nko" className="flex items-center gap-2">
          <h1 className="font-semibold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ߒߞߏ Learn N'Ko
          </h1>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <UserNav />
      </div>
    </div>
  );
}