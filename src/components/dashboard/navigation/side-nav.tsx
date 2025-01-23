"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Settings,
  PlusCircle,
  ChevronRight,
  ChevronLeft,
  Coffee,
  Calendar,
  MapPin,
  Users,
  ShoppingBag,
  Warehouse,
  FileText,
  BarChart2,
  QrCode,
  CreditCard,
  Trash2,
  Briefcase,
  Contact,
  Route as RouteIcon,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/store/use-sidebar";
import { useEffect, useState } from "react";

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
    color: "text-sky-500"
  },
  {
    label: "QR",
    icon: QrCode,
    href: "/dashboard/qr",
    color: "text-orange-500"
  },
  {
    label: "Contacts",
    icon: Contact,
    href: "/dashboard/contacts",
    color: "text-violet-500"
  },
  {
    label: "Reports",
    icon: BarChart2,
    href: "/dashboard/sales",
    color: "text-red-500"
  },
  {
    label: "POS",
    icon: CreditCard,
    href: "/dashboard/pos",
    color: "text-blue-500"
  },
  {
    label: "Orders",
    icon: ShoppingBag,
    href: "/dashboard/order",
    color: "text-green-500"
  },
  {
    label: "Waste",
    icon: Trash2,
    href: "/dashboard/waste",
    color: "text-yellow-500"
  },
  {
    label: "Inventory",
    icon: Warehouse,
    href: "/dashboard/inventory",
    color: "text-purple-500"
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-orange-500"
  },
  {
    label: "Scheduling",
    icon: Calendar,
    href: "/dashboard/scheduling",
    color: "text-red-500",
  },
  {
    label: "Directory",
    icon: Briefcase,
    href: "/dashboard/directory",
    color: "text-emerald-500"
  },
  {
    label: "Route",
    icon: RouteIcon,
    href: "/dashboard/routes",
    color: "text-teal-500"
  },
  {
    label: "Visit",
    icon: Eye,
    href: "/dashboard/visits",
    color: "text-cyan-500"
  },
  {
    label: "Shops",
    icon: Coffee,
    href: "/dashboard/coffee-shops",
    color: "text-indigo-500"
  },
];


export function SideNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { isCollapsed, toggleCollapse } = useSidebar();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <aside
      className={cn(
        "fixed left-0 z-50 flex h-full flex-col bg-background border-r",
        isCollapsed ? "w-[50px]" : "w-48",
        "transition-all duration-300 ease-in-out"
      )}
    >
      <TooltipProvider delayDuration={0}>
        <div className="flex h-14 items-center justify-between px-2 border-b">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              <span className="font-bold text-sm">BUF BARISTA</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={cn("", isCollapsed ? "ml-0" : "ml-auto")}
            onClick={toggleCollapse}
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>

        <div className="p-2">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard/contacts/new">
                  <Button size="icon" className="w-full">
                    <PlusCircle className="h-4 w-4" />
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
                <PlusCircle className="mr-2 h-4 w-4" />
                New Contact
              </Button>
            </Link>
          )}
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 py-2">
            {routes.map((route) => (
              isCollapsed ? (
                <Tooltip key={route.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={route.href}
                      className={cn(
                        "flex items-center justify-center rounded-md p-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        pathname === route.href && "bg-accent text-accent-foreground"
                      )}
                    >
                      <route.icon className={cn("h-4 w-4", route.color)} />
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
                    "flex items-center rounded-md p-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === route.href && "bg-accent text-accent-foreground"
                  )}
                >
                  <route.icon className={cn("mr-2 h-4 w-4", route.color)} />
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