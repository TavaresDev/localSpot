"use client";

import { EventCard } from "@/components/events/event-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SpotEventsSectionProps {
  spotId: string;
  events?: any[];
  spotName?: string;
}

export function SpotEventsSection({ spotId, events = [], spotName }: SpotEventsSectionProps) {
  const router = useRouter();
  
  const handleViewDetails = (event: any) => {
    router.push(`/events/${event.id}`);
  };


  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Calendar className="mr-2 h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-2">No upcoming events</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Be the first to organize an event at {spotName || 'this spot'}!
          </p>
          <Link href={`/events/create?spotId=${spotId}`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Calendar className="mr-2 h-5 w-5" />
            Upcoming Events ({events.length})
          </CardTitle>
          <Link href={`/events/create?spotId=${spotId}`}>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={{
              ...event,
              spot: {
                id: spotId,
                name: spotName || 'Unknown Spot',
                // Add minimal spot data needed for EventCard
                spotType: 'unknown',
                difficulty: 'unknown',
                locationLat: 0,
                locationLng: 0,
                visibility: 'public',
                status: 'approved',
                user: { id: '', name: '' }
              }
            }}
            onViewDetails={() => handleViewDetails(event)}
            compact
          />
        ))}
        
        {events.length >= 10 && (
          <div className="text-center pt-4">
            <Link href={`/events?spotId=${spotId}`}>
              <Button variant="outline">
                View All Events
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}