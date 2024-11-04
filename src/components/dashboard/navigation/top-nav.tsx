"use client";

import Link from "next/link";
import { MobileNav } from "./mobile-nav";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/auth/user-button";
import { Coffee } from "lucide-react";

export function TopNav() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <MobileNav />
        <Link href="/dashboard" className="flex items-center gap-2">
          <Coffee className="h-5 w-5" />
          <span className="font-bold">Buf Barista</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <UserButton />
      </div>
    </div>
  );
}