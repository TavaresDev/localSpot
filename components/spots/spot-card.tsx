"use client";

import { SpotWithUser, getSpotTypeIcon, getSpotTypeColor, getSpotTypeDisplay } from "@/lib/types/spots";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  User,
  Clock,
  Shield,
  Lock,
  Users,
  Globe,
  ChevronRight
} from "lucide-react";

interface SpotCardProps {
  spot: SpotWithUser;
  onViewDetails?: () => void;
  onEditSpot?: () => void;
  onRequestPublic?: () => void;
  isOwner?: boolean;
  compact?: boolean;
}

export function SpotCard({
  spot,
  onViewDetails,
  onEditSpot,
  onRequestPublic,
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

  const getSpotImage = () => {
    // Check if spot has photos (now expecting string URLs)
    if (Array.isArray(spot.photos) && spot.photos.length > 0 && typeof spot.photos[0] === 'string') {
      return spot.photos[0];
    }

    // Return spot type specific placeholder
    switch (spot.spotType) {
      case "downhill": return "/placeholders/downhill.svg";
      case "freeride": return "/placeholders/freeride.svg";
      case "freestyle": return "/placeholders/freestyle.svg";
      case "cruising": return "/placeholders/cruising.svg";
      case "dancing": return "/placeholders/dancing.svg";
      case "pumping": return "/placeholders/pumping.svg";
      default: return "/placeholders/default-spot.svg";
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
    <Card className={`group hover:shadow-xl py-0 transition-all duration-300 overflow-hidden ${getStatusColor(spot.status)}`}>
      {/* Image Header */}
      <div className="relative h-40 overflow-hidden">
        <Image
          src={getSpotImage()}
          alt={spot.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // Fallback to generic placeholder if specific one fails
            e.currentTarget.src = "/placeholders/default-spot.svg";
          }}
        />

        {/* Overlay with spot type and visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* <div className="absolute top-3 left-3 flex items-center space-x-2">
          <div
            className="p-2 rounded-full text-white shadow-lg"
            style={{ backgroundColor: getSpotTypeColor(spot.spotType) }}
          >
            <span className="text-lg">{getSpotTypeIcon(spot.spotType)}  icon</span>
          </div>
        </div> */}

        <div className="absolute top-3 right-3 flex items-center space-x-2">
          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full">
            {getVisibilityIcon(spot.visibility)}
          </div>
          {spot.status !== "approved" && (
            <Badge variant="secondary" className="bg-yellow-500/90 text-white">
              {spot.status}
            </Badge>
          )}
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg truncate drop-shadow-lg">
            {spot.name}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <Badge
              className={`text-xs text-white shadow-sm ${getDifficultyColor(spot.difficulty)}`}
            >
              {spot.difficulty}
            </Badge>
            <span className="text-white/90 text-sm">
              {getSpotTypeDisplay(spot.spotType)}
            </span>
          </div>
        </div>
      </div>

      <CardContent className={compact ? "p-4" : "p-5"}>
        {/* Description */}
        {spot.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
            {spot.description}
          </p>
        )}

        {/* Metadata */}
        {/* <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{spot.user.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(spot.createdAt).toLocaleDateString()}
            </span>
          </div>

          {spot.bestTimes && (
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Best times: {spot.bestTimes}</span>
            </div>
          )}
        </div> */}

        {/* Safety & Rules */}
        {spot.safetyNotes && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                {spot.safetyNotes}
              </p>
            </div>
          </div>
        )}

        {spot.rules && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              📋 {spot.rules}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 pb-4 px-5">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="flex-1 group-hover:border-primary transition-colors"
          >
            View Details
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>

          {/* {isOwner && (
            <Button variant="outline" size="sm" onClick={onEditSpot}>
              Edit
            </Button>
          )} */}

          {/* Make Public button for draft and rejected spots */}
          {isOwner && (spot.status === "draft" || spot.status === "rejected") && onRequestPublic && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestPublic}
              className="text-blue-600 hover:text-blue-700"
            >
              Make Public
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}