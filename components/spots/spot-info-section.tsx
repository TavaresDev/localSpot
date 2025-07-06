"use client";

import { getSpotTypeIcon, SpotWithUser } from "@/lib/types/spots";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  User, 
  Clock, 
  Shield, 
  Lock,
  Users,
  Globe,
  Navigation,
  Camera
} from "lucide-react";

interface SpotInfoSectionProps {
  spot: SpotWithUser & {
    events?: any[];
    _count?: {
      events: number;
    };
  };
}

export function SpotInfoSection({ spot }: any) {

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500 text-white";
      case "intermediate": return "bg-yellow-500 text-white";
      case "advanced": return "bg-orange-500 text-white";
      case "expert": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public": return <Globe className="h-4 w-4" />;
      case "friends": return <Users className="h-4 w-4" />;
      case "private": return <Lock className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20";
      case "pending": return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20";
      case "rejected": return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Spot Info */}
      <Card className={`${getStatusColor(spot.status)}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <span className="text-3xl">{getSpotTypeIcon(spot.spotType)}</span>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-2xl">{spot.name}</CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className={`text-xs ${getDifficultyColor(spot.difficulty)}`}>
                    {spot.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <span className="mr-1">{getVisibilityIcon(spot.visibility)}</span>
                    {spot.visibility}
                  </Badge>
                  {spot.status !== "approved" && (
                    <Badge variant="outline" className="text-xs">
                      {spot.status}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {spot.description && (
            <p className="text-muted-foreground leading-relaxed">
              {spot.description}
            </p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Location</span>
              </div>
              <div className="ml-6 text-muted-foreground">
                <p>Lat: {spot.locationLat}</p>
                <p>Lng: {spot.locationLng}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Type</span>
              </div>
              <div className="ml-6 text-muted-foreground capitalize">
                {spot.spotType}
              </div>
            </div>
            
            {spot._count && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Events</span>
                </div>
                <div className="ml-6 text-muted-foreground">
                  {spot._count.events} total events
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Created by</span>
              </div>
              <div className="ml-6 text-muted-foreground">
                {spot.user?.name || 'Unknown'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Times */}
      {spot.bestTimes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Clock className="mr-2 h-5 w-5" />
              Best Times to Ride
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{spot.bestTimes}</p>
          </CardContent>
        </Card>
      )}

      {/* Safety Notes */}
      
      {spot.safetyNotes && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-yellow-800 dark:text-yellow-200">
              <Shield className="mr-2 h-5 w-5" />
              Safety Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 dark:text-yellow-300">{spot.safetyNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Rules */}
      {spot.rules && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-blue-800 dark:text-blue-200">
              <span className="mr-2 text-lg">📋</span>
              Rules & Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 dark:text-blue-300">{spot.rules}</p>
          </CardContent>
        </Card>
      )}

      {/* Photos */}
      {spot.photos && Array.isArray(spot.photos) && spot.photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Camera className="mr-2 h-5 w-5" />
              Photos ({(spot.photos as string[]).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Photo gallery coming soon - {(spot.photos as string[]).length} photo{(spot.photos as string[]).length > 1 ? 's' : ''} available
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}