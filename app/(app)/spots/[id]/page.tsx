"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useSpot } from "@/lib/hooks/queries";
import { SpotInfoSection } from "@/components/spots/spot-info-section";
import { SpotEventsSection } from "@/components/spots/spot-events-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Edit,
  Share2,
  Navigation,
  Calendar,
  MapPin,
  User,
  Loader2,
  Globe
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { SpotService } from "@/lib/services/spotService";
import { useState } from "react";

// Use the proper type from types file

export default function SpotDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const spotId = params.id as string;
  const { data: spot, isLoading, error, refetch } = useSpot(spotId);
  
  // State for "Make Public" button
  const [isRequestingPublic, setIsRequestingPublic] = useState(false);

  const handleEditSpot = () => {
    if (!spot) return;
    router.push(`/spots/${spot.id}/edit`);
  };

  const handleShareSpot = async () => {
    if (!spot) return;
    
    try {
      await navigator.share({
        title: spot.name,
        text: `Check out this longboarding spot: ${spot.name}`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Spot link copied to clipboard!");
      } catch (clipboardError) {
        toast.error("Failed to share spot");
      }
    }
  };

  const handleDirections = () => {
    if (!spot) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.locationLat},${spot.locationLng}`;
    window.open(url, '_blank');
  };

  const handleRequestPublic = async () => {
    if (!spot) return;
    
    setIsRequestingPublic(true);
    try {
      await SpotService.requestPublic(spot.id);
      toast.success("Spot submitted for public approval!");
      // Refetch to potentially update status
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit for approval");
    } finally {
      setIsRequestingPublic(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading spot...</span>
        </div>
      </div>
    );
  }

  if (error || (!isLoading && !spot)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Spot Not Found</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error?.message || "The spot you're looking for doesn't exist or has been removed."}
            </p>
            <Link href="/spots">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Spots
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Additional safety check for incomplete data
  if (!spot?.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Spot Data Incomplete</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This spot has incomplete data. The creator information is missing.
            </p>
            <Link href="/spots">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Spots
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // This should never happen due to the error check above, but TypeScript needs assurance
  if (!spot) {
    return null;
  }

  const isOwner = user?.id === spot.userId;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/spots">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold truncate">{spot.name}</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleShareSpot}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              {isOwner && (
                <Button variant="outline" size="sm" onClick={handleEditSpot}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <SpotInfoSection spot={spot} />
            <SpotEventsSection 
              spotId={spot.id} 
              events={[]} 
              spotName={spot.name}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleDirections}>
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/events/create?spotId=${spot.id}`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Event
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/map?spotId=${spot.id}`}>
                    <MapPin className="h-4 w-4 mr-2" />
                    View on Map
                  </Link>
                </Button>

                {/* Make Public button for spot owners */}
                {isOwner && (spot.status === "draft" || spot.status === "rejected") && (
                  <Button 
                    variant="outline" 
                    className="w-full text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300" 
                    onClick={handleRequestPublic}
                    disabled={isRequestingPublic}
                  >
                    {isRequestingPublic ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Globe className="h-4 w-4 mr-2" />
                    )}
                    {isRequestingPublic ? "Submitting..." : "Make Public"}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Spot Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Spot Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Events</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      spot.status === "approved" ? "bg-green-500" :
                      spot.status === "pending" ? "bg-yellow-500" :
                      spot.status === "rejected" ? "bg-red-500" :
                      spot.status === "draft" ? "bg-gray-400" :
                      "bg-gray-500"
                    }`} />
                    <span className="font-medium capitalize">{spot.status}</span>
                  </div>
                </div>
                {spot.status === "pending" && (
                  <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                    📋 This spot is under review for public visibility
                  </div>
                )}
                {spot.status === "rejected" && (
                  <div className="text-xs text-muted-foreground bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    ❌ This spot was not approved for public visibility
                  </div>
                )}
                {spot.status === "draft" && isOwner && (
                  <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    💡 This is a private draft. Use &quot;Make Public&quot; to submit for community review
                  </div>
                )}
                {spot.status === "rejected" && isOwner && (
                  <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    💡 Use &quot;Make Public&quot; to resubmit this spot for review
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visibility</span>
                  <span className="font-medium capitalize">{spot.visibility}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {new Date(spot.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Spot Creator */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Created By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{spot.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Spot creator
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}