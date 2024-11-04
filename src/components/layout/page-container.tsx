
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
  const [isMobile, setIsMobile] = useState(false);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle responsive behavior
  useEffect(() => {
    // Initial check
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical tablet breakpoint
    };

    // Check on mount
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "min-h-screen w-full transition-all duration-300 ease-in-out",
        // Desktop styles with margins
        !isMobile && {
          "ml-64 mr-4": !isCollapsed,
          "ml-16 mr-4": isCollapsed,
          "ml-0 mr-4": isResetting,
        },
        // Mobile styles with equal margins
        isMobile && "mx-4",
        // Safe area padding for iPhone
        "pb-safe-area-inset-bottom",
        // Additional padding for mobile navigation
        "sm:pb-0",
        // Container padding with adjusted horizontal spacing
        "px-0 md:px-6 lg:px-8", // Removed base px-4 since we're using margins
        // Touch scrolling for mobile
        "touch-pan-y",
        className
      )}
      style={{
        // Add safe area insets for iPhone
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <div className={cn(
        "mx-auto max-w-screen-2xl relative",
        // Add top padding to account for mobile header
        isMobile ? "pt-16" : "pt-0",
        // Responsive padding with adjusted horizontal spacing
        "py-4 md:py-6 lg:py-8",
        // Additional right margin for desktop view
        !isMobile && "mr-16",
      )}>
        {children}
      </div>
    </div>
  );
}
