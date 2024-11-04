"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/use-sidebar";
import { useEffect, useState } from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  const { isCollapsed } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "min-h-screen transition-all duration-300 ease-in-out",
        isCollapsed ? "ml-[70px]" : "ml-[170px]",
        className
      )}
    >
      <div className="mx-auto max-w-screen-2xl">
        {children}
      </div>
    </div>
  );
}
