"use client";

import { EventWithSpot, getSpotTypeIcon } from "@/lib/types/spots";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  User, 
  Clock, 
  Calendar,
  Repeat,
  Camera,
  Users as UsersIcon
} from "lucide-react";

interface EventCardProps {
  event: EventWithSpot;
  onViewDetails?: () => void;
  onEditEvent?: () => void;
  onJoinEvent?: () => void;
  isOwner?: boolean;
  compact?: boolean;
}

export function EventCard({ 
  event, 
  onViewDetails, 
  onEditEvent, 
  onJoinEvent,
  isOwner = false,
  compact = false 
}: EventCardProps) {

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500 hover:bg-green-600";
      case "intermediate": return "bg-yellow-500 hover:bg-yellow-600";
      case "advanced": return "bg-orange-500 hover:bg-orange-600";
      case "expert": return "bg-red-500 hover:bg-red-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const formatEventTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const startDate = start.toLocaleDateString();
    const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return {
      date: startDate,
      time: `${startTimeStr} - ${endTimeStr}`,
      isToday: start.toDateString() === new Date().toDateString(),
      isPast: start < new Date(),
      isUpcoming: start > new Date()
    };
  };

  const timeInfo = formatEventTime(event.startTime.toString(), event.endTime.toString());

  const getRecurrenceText = (recurrenceData: any) => {
    if (!recurrenceData) return null;
    
    const { frequency, interval } = recurrenceData;
    const intervalText = interval === 1 ? "" : `every ${interval} `;
    
    switch (frequency) {
      case "weekly": return `Repeats ${intervalText}week${interval > 1 ? 's' : ''}`;
      case "monthly": return `Repeats ${intervalText}month${interval > 1 ? 's' : ''}`;
      case "daily": return `Repeats ${intervalText}day${interval > 1 ? 's' : ''}`;
      default: return "Recurring event";
    }
  };

  const getEventStatusColor = () => {
    if (timeInfo.isPast) {
      return "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20";
    }
    if (timeInfo.isToday) {
      return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20";
    }
    if (timeInfo.isUpcoming) {
      return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20";
    }
    return "";
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${getEventStatusColor()}`}>
      <CardContent className={compact ? "p-4" : "p-6"}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <span className="text-xl">📅</span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg truncate">{event.title}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant={timeInfo.isToday ? "default" : timeInfo.isPast ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {timeInfo.isToday ? "Today" : timeInfo.isPast ? "Past" : "Upcoming"}
                </Badge>
                {event.isRecurring && (
                  <Badge variant="outline" className="text-xs">
                    <Repeat className="h-3 w-3 mr-1" />
                    Recurring
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {Array.isArray(event.photos) && event.photos.length > 0 && (
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Camera className="h-3 w-3" />
              <span className="text-xs">{event.photos.length}</span>
            </div>
          )}
        </div>
        
        {event.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {event.description}
          </p>
        )}
        
        {/* Event Time Info */}
        <div className="space-y-2 text-xs text-muted-foreground mb-3">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span className="font-medium">{timeInfo.date}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{timeInfo.time}</span>
          </div>
          
          {/* {event?.isRecurring && event.recurrenceData && typeof event.recurrenceData === 'object' && (
            <div className="flex items-center space-x-1">
              <Repeat className="h-3 w-3" />
              <span>{getRecurrenceText(event.recurrenceData)}</span>
            </div>
          )} */}
        </div>

        {/* Spot Info */}
        <div className="bg-accent/50 rounded-lg p-3 mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm">{getSpotTypeIcon(event.spot.spotType)}</span>
            <h4 className="font-medium text-sm">{event.spot.name}</h4>
            <Badge 
              variant="secondary" 
              className={`text-xs text-white ${getDifficultyColor(event.spot.difficulty)}`}
            >
              {event.spot.difficulty}
            </Badge>
          </div>
          
          {event.spot.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {event.spot.description}
            </p>
          )}
          
          <div className="flex items-center space-x-1 mt-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="capitalize">{event.spot.spotType}</span>
          </div>
        </div>
        
        {/* Event Creator */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>by {event.user?.name || 'Unknown'}</span>
          </div>
          
          <div className="text-xs">
            Created {new Date(event.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 px-6">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            View Details
          </Button>
          
          <div className="flex space-x-2">
            {!isOwner && !timeInfo.isPast && onJoinEvent && (
              <Button variant="default" size="sm" onClick={onJoinEvent}>
                <UsersIcon className="h-3 w-3 mr-1" />
                Join
              </Button>
            )}
            
            {isOwner && (
              <Button variant="outline" size="sm" onClick={onEditEvent}>
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}