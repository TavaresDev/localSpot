"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  MapIcon, 
  Home, 
  Search, 
  Plus, 
  User,
  Calendar
} from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/map",
    label: "Map",
    icon: MapIcon,
  },
  {
    href: "/spots",
    label: "Spots",
    icon: Search,
  },
  {
    href: "/events",
    label: "Events",
    icon: Calendar,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 text-xs font-medium transition-colors rounded-lg min-w-0",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 mb-1",
                isActive ? "text-primary" : "text-current"
              )} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Floating Action Button for creating new spots
export function CreateSpotFAB() {
  const pathname = usePathname();
  
  // Show FAB only on map and spots pages
  const showFAB = pathname === "/map" || pathname === "/spots" || pathname.startsWith("/spots");

  if (!showFAB) return null;

  return (
    <Link
      href="/spots/create"
      className="fixed bottom-20 right-4 z-40 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors lg:bottom-4"
    >
      <Plus className="h-6 w-6" />
      <span className="sr-only">Create new spot</span>
    </Link>
  );
}