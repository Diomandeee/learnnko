"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/use-sidebar";
import { useEffect, useState } from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  const { isCollapsed, isResetting } = useSidebar();
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
        {
          "ml-64": !isCollapsed,
          "ml-16": isCollapsed,
          "ml-0": isResetting,
        },
        className
      )}
    >
      {children}
    </div>
  );
}
