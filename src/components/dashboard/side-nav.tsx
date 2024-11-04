"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Settings,
  PlusCircle,
  ChevronRight,
  ChevronLeft,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/store/use-sidebar";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
    color: "text-sky-500"
  },
  {
    label: "Contacts",
    icon: Users,
    href: "/dashboard/contacts",
    color: "text-violet-500"
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-orange-500"
  }
];

export function SideNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { isCollapsed, toggleCollapse } = useSidebar();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Mobile Navigation Bar
  if (isMobile) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center border-b bg-background px-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <div className="p-6 flex items-center justify-between border-b">
              <span className="font-bold">BUF BARISTA CRM</span>
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </SheetClose>
            </div>
            <ScrollArea className="h-[calc(100vh-4rem)]">
              <div className="p-4">
                <Link 
                  href="/dashboard/contacts/new" 
                  onClick={() => setIsOpen(false)}
                >
                  <Button className="w-full">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    New Contact
                  </Button>
                </Link>
              </div>
              <nav className="space-y-2 px-2">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === route.href 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <route.icon className={cn("mr-2 h-5 w-5", route.color)} />
                    {route.label}
                  </Link>
                ))}
              </nav>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <div className="flex items-center ml-4">
          <span className="font-bold">BUF BARISTA CRM</span>
        </div>
      </div>
    );
  }

  // Desktop Sidebar
  return (
    <aside
      className={cn(
        "fixed left-0 z-50 hidden md:flex h-full w-60 flex-col bg-background border-r",
        isCollapsed && "w-[70px]",
        "transition-all duration-300 ease-in-out"
      )}
    >
      <TooltipProvider delayDuration={0}>
        <div className="flex h-16 items-center justify-between px-3 border-b">
          {!isCollapsed && (
            <span className="font-bold">BUF BARISTA CRM</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={toggleCollapse}
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>

        <div className="p-3">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard/contacts/new">
                  <Button size="icon" className="w-full">
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                New Contact
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link href="/dashboard/contacts/new">
              <Button className="w-full">
                <PlusCircle className="mr-2 h-5 w-5" />
                New Contact
              </Button>
            </Link>
          )}
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-2 py-2">
            {routes.map((route) => (
              isCollapsed ? (
                <Tooltip key={route.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={route.href}
                      className={cn(
                        "flex items-center justify-center rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        pathname === route.href && "bg-accent text-accent-foreground"
                      )}
                    >
                      <route.icon className={cn("h-5 w-5", route.color)} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {route.label}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === route.href && "bg-accent text-accent-foreground"
                  )}
                >
                  <route.icon className={cn("mr-2 h-5 w-5", route.color)} />
                  {route.label}
                </Link>
              )
            ))}
          </div>
        </ScrollArea>
      </TooltipProvider>
    </aside>
  );
}