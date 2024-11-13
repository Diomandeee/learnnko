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
  Coffee,
} from "lucide-react";

import { 
  FaChartLine as SalesIcon,
  FaCashRegister as PosIcon,
  FaClipboardList as OrdersIcon,
  FaTrash as WasteIcon,
  FaBoxes as InventoryIcon,
  FaCog as SettingsIcon,
} from "react-icons/fa"; 

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
    icon: SettingsIcon,
    href: "/dashboard/qr",
    color: "text-orange-500"
  },
  {
    label: "Contacts",
    icon: Users,
    href: "/dashboard/contacts",
    color: "text-violet-500"
  },
  {
    label: "Reports",
    icon: SalesIcon,
    href: "/dashboard/sales",
    color: "text-red-500"
  },
  {
    label: "POS",
    icon: PosIcon,
    href: "/dashboard/pos",
    color: "text-blue-500"
  },
  {
    label: "Orders",
    icon: OrdersIcon,
    href: "/dashboard/order",
    color: "text-green-500"
  },
  {
    label: "Waste",
    icon: WasteIcon,
    href: "/dashboard/waste",
    color: "text-yellow-500"
  },
  {
    label: "Inventory",
    icon: InventoryIcon,
    href: "/dashboard/inventory",
    color: "text-purple-500"
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