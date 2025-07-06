"use client";

import { SpotWithUser } from "@/lib/types/spots";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  User,
  Clock,
  Shield,
  Lock,
  Users,
  Globe
} from "lucide-react";

interface SpotCardProps {
  spot: SpotWithUser;
  onViewDetails?: () => void;
  onEditSpot?: () => void;
  isOwner?: boolean;
  compact?: boolean;
}

export function SpotCard({
  spot,
  onViewDetails,
  onEditSpot,
  isOwner = false,
  compact = false
}: SpotCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500 hover:bg-green-600";
      case "intermediate": return "bg-yellow-500 hover:bg-yellow-600";
      case "advanced": return "bg-orange-500 hover:bg-orange-600";
      case "expert": return "bg-red-500 hover:bg-red-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getSpotTypeIcon = (spotType: string) => {
    switch (spotType) {
      case "downhill": return "🏔️";
      case "freeride": return "🛣️";
      case "freestyle": return "🛴";
      case "cruising": return "🏞️";
      case "dancing": return "💃";
      case "pumping": return "⚡";
      default: return "📍";
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public": return <Globe className="h-3 w-3" />;
      case "friends": return <Users className="h-3 w-3" />;
      case "private": return <Lock className="h-3 w-3" />;
      default: return <Globe className="h-3 w-3" />;
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
    <Card className={`hover:shadow-lg transition-shadow ${getStatusColor(spot.status)}`}>
      <CardContent className={compact ? "p-4" : "p-6"}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <span className="text-xl">{getSpotTypeIcon(spot.spotType)}</span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg truncate">{spot.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant="secondary"
                  className={`text-xs text-white ${getDifficultyColor(spot.difficulty)}`}
                >
                  {spot.difficulty}
                </Badge>
                {spot.status !== "approved" && (
                  <Badge variant="outline" className="text-xs">
                    {spot.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-muted-foreground">
            {getVisibilityIcon(spot.visibility)}
          </div>
        </div>

        {spot.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {spot.description}
          </p>
        )}

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{spot.user.name}</span>
              </div>

              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span className="capitalize">{spot.spotType}</span>
              </div>
            </div>

            <div className="text-xs">
              {new Date(spot.createdAt).toLocaleDateString()}
            </div>
          </div>

          {spot.bestTimes && (
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Best: {spot.bestTimes}</span>
            </div>
          )}
        </div>

        {spot.safetyNotes && (
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
            <div className="flex items-start space-x-1">
              <Shield className="h-3 w-3 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-yellow-800 dark:text-yellow-200">
                {spot.safetyNotes}
              </p>
            </div>
          </div>
        )}

        {spot.rules && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
            <p className="text-blue-800 dark:text-blue-200">
              📋 {spot.rules}
            </p>
          </div>
        )}

        {/* {Array.isArray(spot.photos) && spot.photos.length > 0 && (
          <div className="mt-3">
            <h4 className="font-semibold text-sm mb-1">Photos:</h4>
            <div className="flex flex-wrap gap-2">
              {spot.photos.map((photo: string, idx: number) => (
                <img
                  key={idx}
                  src={photo || "/ldp.svg"}
                  alt={`Spot photo ${idx + 1}`}
                  className="w-16 h-16 object-cover rounded"
                />
              ))}
            </div>
          </div>
        )} */}
      </CardContent>

      <CardFooter className="pt-0 pb-4 px-6">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            View Details
          </Button>

          {isOwner && (
            <Button variant="outline" size="sm" onClick={onEditSpot}>
              Edit
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}