"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useUserSpots } from "@/lib/hooks/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SignInButton } from "@/components/auth/sign-in-button";
import { 
  ArrowLeft, 
  MapPin, 
  Settings, 
  Calendar,
  Heart,
  Plus,
  LogOut,
  User,
  Mail
} from "lucide-react";
import Link from "next/link";


export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuth();
  const router = useRouter();
  
  // Replace the manual fetch with hook
  const { data: userSpotsData, isLoading: spotsLoading } = useUserSpots(10);
  const userSpots = userSpotsData?.spots || [];

  // Show sign-in prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Sign In Required</CardTitle>
            <p className="text-muted-foreground">
              Please sign in to view your profile and manage your spots.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <SignInButton 
              variant="default" 
              className="w-full"
              returnTo="/profile"
            >
              Sign In to Continue
            </SignInButton>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Skeleton */}
        <div className="bg-background border-b p-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>

        {/* Profile Content Skeleton */}
        <div className="p-4 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold">Profile</h1>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-4 space-y-6">
        {/* User Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.image || ""} alt={user?.name} />
                <AvatarFallback className="text-lg">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                <div className="flex items-center text-muted-foreground text-sm mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  {user?.email}
                </div>
                <div className="flex items-center text-muted-foreground text-sm mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{userSpots.length}</div>
                <div className="text-muted-foreground text-sm">Spots Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">0</div>
                <div className="text-muted-foreground text-sm">Favorites</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Spots Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              My Spots
            </CardTitle>
            <Button size="sm" asChild>
              <Link href="/spots/create">
                <Plus className="h-4 w-4 mr-1" />
                Add Spot
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {spotsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : userSpots.length > 0 ? (
              <div className="space-y-3">
                {userSpots.map((spot) => (
                  <div key={spot.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{spot.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {spot.spotType}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {spot.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/map?spotId=${spot.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
                {userSpots.length >= 10 && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/spots?userId=me">
                      View All My Spots
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No spots yet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Start building your spot collection by adding your favorite longboarding locations.
                </p>
                <Button asChild>
                  <Link href="/spots/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Spot
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favorites Section (Coming Soon) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Heart className="mr-2 h-5 w-5" />
              Favorite Spots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Favorites Coming Soon</h3>
              <p className="text-muted-foreground text-sm">
                Save your favorite spots for quick access.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Settings Link */}
        <Card>
          <CardContent className="p-4">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}