"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EventWithSpot, RecurrenceData } from "@/lib/types/spots";
import { useAuth } from "@/lib/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  Repeat, 
  Camera,
  Edit,
  Share2,
  Navigation,
  Shield,
  Globe,
  Lock,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventWithSpot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchEvent(params.id as string);
    }
  }, [params.id]);

  const fetchEvent = async (eventId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch event");
      }
      
      const data = await response.json();
      setEvent(data);
    } catch (error) {
      console.error("Error fetching event:", error);
      setError("Failed to load event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // RSVP functionality removed as requested

  const handleEditEvent = () => {
    if (!event) return;
    router.push(`/events/${event.id}/edit`);
  };

  const handleShareEvent = async () => {
    if (!event) return;
    
    try {
      await navigator.share({
        title: event.title,
        text: `Check out this longboarding event: ${event.title}`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Event link copied to clipboard!");
      } catch (clipboardError) {
        toast.error("Failed to share event");
      }
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

  const formatEventTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const startDate = start.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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

  const getRecurrenceText = (recurrenceData: RecurrenceData) => {
    if (!recurrenceData) return null;
    
    const { frequency, interval, endDate } = recurrenceData;
    const intervalText = interval === 1 ? "" : `every ${interval} `;
    
    let baseText = "";
    switch (frequency) {
      case "weekly": 
        baseText = `Repeats ${intervalText}week${interval > 1 ? 's' : ''}`;
        break;
      case "monthly": 
        baseText = `Repeats ${intervalText}month${interval > 1 ? 's' : ''}`;
        break;
      case "daily": 
        baseText = `Repeats ${intervalText}day${interval > 1 ? 's' : ''}`;
        break;
      default: 
        baseText = "Recurring event";
    }
    
    if (endDate) {
      baseText += ` until ${new Date(endDate).toLocaleDateString()}`;
    }
    
    return baseText;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading event...</span>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Event Not Found</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error || "The event you're looking for doesn't exist or has been removed."}
            </p>
            <Link href="/events">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Additional safety check for incomplete data
  if (!event.spot || !event.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Event Data Incomplete</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This event has incomplete data. The associated spot or user information is missing.
            </p>
            <Link href="/events">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeInfo = formatEventTime(event.startTime.toString(), event.endTime.toString());
  const isOwner = user?.id === event.userId;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/events">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold truncate">{event.title}</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleShareEvent}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              {isOwner && (
                <Button variant="outline" size="sm" onClick={handleEditEvent}>
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
            
            {/* Event Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-2xl">📅</span>
                    <span>Event Details</span>
                  </CardTitle>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={timeInfo.isToday ? "default" : timeInfo.isPast ? "secondary" : "outline"}
                    >
                      {timeInfo.isToday ? "Today" : timeInfo.isPast ? "Past" : "Upcoming"}
                    </Badge>
                    
                    {event.isRecurring && (
                      <Badge variant="outline">
                        <Repeat className="h-3 w-3 mr-1" />
                        Recurring
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{timeInfo.date}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{timeInfo.time}</span>
                  </div>
                  
                  {event.isRecurring && event.recurrenceData ? (
                    <div className="flex items-center space-x-3">
                      <Repeat className="h-4 w-4 text-muted-foreground" />
                      <span>{getRecurrenceText(event.recurrenceData as RecurrenceData)}</span>
                    </div>
                  ) : null}
                </div>
                
                {event.photos && Array.isArray(event.photos) && event.photos.length > 0 ? (
                  <div className="pt-4">
                    <h4 className="font-medium mb-2 flex items-center space-x-2">
                      <Camera className="h-4 w-4" />
                      <span>Event Photos</span>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {(event.photos as string[]).length} photo{(event.photos as string[]).length > 1 ? 's' : ''} available
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Spot Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getSpotTypeIcon(event.spot.spotType)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-lg">{event.spot.name}</h3>
                        <Badge className={`text-xs ${getDifficultyColor(event.spot.difficulty)}`}>
                          {event.spot.difficulty}
                        </Badge>
                        {getVisibilityIcon(event.spot.visibility)}
                      </div>
                      
                      {event.spot.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {event.spot.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="capitalize">{event.spot.spotType}</span>
                        <span>•</span>
                        <span>by {event.user?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {event.spot.bestTimes && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium">Best Times:</span>
                        <span className="text-blue-800 dark:text-blue-200">{event.spot.bestTimes}</span>
                      </div>
                    </div>
                  )}
                  
                  {event.spot.safetyNotes && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-start space-x-2 text-sm">
                        <Shield className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-yellow-800 dark:text-yellow-200">Safety Notes:</span>
                          <p className="text-yellow-700 dark:text-yellow-300 mt-1">{event.spot.safetyNotes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {event.spot.rules && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-start space-x-2 text-sm">
                        <span className="text-blue-600 dark:text-blue-400">📋</span>
                        <div>
                          <span className="font-medium text-blue-800 dark:text-blue-200">Rules:</span>
                          <p className="text-blue-700 dark:text-blue-300 mt-1">{event.spot.rules}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/map?spotId=${event.spot.id}`}>
                    <Navigation className="h-4 w-4 mr-2" />
                    View on Map
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/spots/${event.spot.id}`}>
                    <MapPin className="h-4 w-4 mr-2" />
                    View Spot
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Event Creator */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{event.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(event.createdAt).toLocaleDateString()}
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