// src/components/layout/page-container.tsx
"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/use-sidebar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  const { isCollapsed } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Check if we're on the pipeline page
  const isPipelinePage = pathname === "/dashboard/pipeline";

  return (
    <div
      className={cn(
        "min-h-screen transition-all duration-300 ease-in-out",
        {
          // Only apply left padding if not on pipeline page
          "pl-[70px]": !isPipelinePage && isCollapsed,
          "pl-[170px]": !isPipelinePage && !isCollapsed,
          // For pipeline page, use smaller padding
          "pl-[50px]": isPipelinePage && isCollapsed,
          "pl-[150px]": isPipelinePage && !isCollapsed,
        },
        className
      )}
    >
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  );
}