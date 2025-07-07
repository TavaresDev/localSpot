"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";
import { SignInButton } from "@/components/auth/sign-in-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MapIcon, 
  Home, 
  Search, 
  Plus, 
  User,
  Calendar,
  LogOut,
  Settings,
} from "lucide-react";

const publicNavItems = [
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
];

const authenticatedNavItems = [
  // {
  //   href: "/",
  //   label: "Home",
  //   icon: Home,
  // },
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
];

export function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated, user, signOut, isLoading } = useAuth();

  const navItems = isAuthenticated ? authenticatedNavItems : publicNavItems;
  const shouldShowSignIn = !isAuthenticated && !isLoading;
  const shouldShowProfile = isAuthenticated && user;

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

        {/* Sign In Button for unauthenticated users */}
        {shouldShowSignIn && (
          <div className="flex flex-col items-center justify-center px-3 py-2 min-w-0">
            <SignInButton 
              variant="ghost" 
              size="sm"
              className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
              returnTo={pathname}
            >
              <div className="flex flex-col items-center">
                <User className="h-5 w-5 mb-1" />
                <span className="truncate">Sign In</span>
              </div>
            </SignInButton>
          </div>
        )}

        {/* Profile Dropdown for authenticated users */}
        {shouldShowProfile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex flex-col items-center justify-center px-3 py-2 text-xs font-medium transition-colors rounded-lg min-w-0 h-auto text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Avatar className="h-5 w-5 mb-1">
                  <AvatarImage src={user.image || ""} alt={user.name} />
                  <AvatarFallback className="text-[8px]">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">Profile</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" className="w-56 mb-2">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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
      className="fixed bottom-40 right-2 z-40 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors lg:bottom-4"
    >
      <Plus className="h-6 w-6" />
      <span className="sr-only">Create new spot</span>
    </Link>
  );
}