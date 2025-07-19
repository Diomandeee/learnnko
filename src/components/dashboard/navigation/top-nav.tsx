"use client";

import Link from "next/link";
import { MobileNav } from "./mobile-nav";

export function TopNav() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <MobileNav />
        <Link href="/dashboard" className="flex items-center gap-2">
          <h1 className="font-semibold">French Connect</h1>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {/* User functionality removed - no authentication */}
      </div>
    </div>
  );
}