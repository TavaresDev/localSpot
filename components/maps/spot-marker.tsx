"use client";

import { SpotWithUser } from "@/lib/types/spots";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, User } from "lucide-react";

interface SpotMarkerProps {
  spot: SpotWithUser;
  onClick?: () => void;
}

export function SpotMarker({ spot, onClick }: SpotMarkerProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500";
      case "intermediate": return "bg-yellow-500";
      case "advanced": return "bg-orange-500";
      case "expert": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getSpotTypeIcon = (spotType: string) => {
    switch (spotType) {
      case "hill": return "🏔️";
      case "street": return "🛣️";
      case "park": return "🏞️";
      case "bowl": return "🥣";
      case "vert": return "📐";
      case "cruising": return "🛴";
      case "distance": return "📏";
      default: return "📍";
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow max-w-sm"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getSpotTypeIcon(spot.spotType)}</span>
            <h3 className="font-semibold text-sm truncate">{spot.name}</h3>
          </div>
          <Badge 
            variant="secondary" 
            className={`text-xs text-white ${getDifficultyColor(spot.difficulty)}`}
          >
            {spot.difficulty}
          </Badge>
        </div>
        
        {spot.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {spot.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>{spot.user.name}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{spot.spotType}</span>
          </div>
        </div>

        {spot.safetyNotes && (
          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
            <p className="text-yellow-800 dark:text-yellow-200">
              ⚠️ {spot.safetyNotes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}