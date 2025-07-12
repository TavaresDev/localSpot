"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapView } from "@/components/maps/map-view-new";
import { SpotCard } from "@/components/spots/spot-card";
import { EventCard } from "@/components/events/event-card";
import { SpotWithUser, EventWithSpot } from "@/lib/types/spots";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MapIcon, List, Calendar } from "lucide-react";
import { useUserLocation } from "@/lib/hooks/useUserLocation";

export default function MapPage() {
  const router = useRouter();
  const [spots, setSpots] = useState<SpotWithUser[]>([]);
  const [events, setEvents] = useState<EventWithSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<SpotWithUser | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventWithSpot | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [showEvents, setShowEvents] = useState<boolean>(true);
  const { location: userLocation } = useUserLocation();


  // Fetch spots immediately (parallel to other loading)
  useEffect(() => {
    async function fetchSpots() {
      try {

        const params = new URLSearchParams();
        // Future: add location-based filtering when userLocation is available
        // if (userLocation) {
        //   params.append("lat", userLocation.lat.toString());
        //   params.append("lng", userLocation.lng.toString());
        //   params.append("radius", "50000"); // 50km radius
        //   params.append("sort", "distance");
        // }

        const response = await fetch(`/api/spots?${params}`);
        if (!response.ok) throw new Error("Failed to fetch spots");

        const data = await response.json();
        setSpots(data.spots || []);
      } catch (error) {
        console.error("Error fetching spots:", error);
      }
    }

    fetchSpots();
  }, []); // Remove userLocation dependency to start loading immediately

  // Fetch events immediately (parallel to spots loading)
  useEffect(() => {
    async function fetchEvents() {
      try {

        const params = new URLSearchParams();
        params.append("upcoming", "true"); // Only show upcoming events on map
        params.append("limit", "100");

        const response = await fetch(`/api/events?${params}`);
        if (!response.ok) throw new Error("Failed to fetch events");

        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    }

    fetchEvents();
  }, []);

  const handleSpotClick = (spot: SpotWithUser) => {
    setSelectedSpot(spot);
    setSelectedEvent(null); // Clear event selection
  };

  const handleEventClick = (event: EventWithSpot) => {
    setSelectedEvent(event);
    setSelectedSpot(null); // Clear spot selection
  };

  const handleMapClick = () => {
    setSelectedSpot(null);
    setSelectedEvent(null);
  };

  // Use default location if user location is not available
  // const mapCenter =

  return (
    <div className="h-screen md:h-[90dvh] flex flex-col">
      {/* Header */}
      {/* <div className="bg-background border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">SpotMap</h1>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("map")}
            className="hidden sm:flex"
          >
            <MapIcon className="h-4 w-4 mr-2" />
            Map
          </Button>

          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="hidden sm:flex"
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>

          <Button
            variant={showEvents ? "default" : "outline"}
            size="sm"
            onClick={() => setShowEvents(!showEvents)}
            className="hidden sm:flex"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Events
          </Button>

          Mobile Sheet for spots list
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="sm:hidden">
                <List className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <div className="space-y-4 overflow-y-auto h-full">
                <h2 className="text-lg font-semibold">
                  Nearby Spots ({spots.length})
                </h2>
                <div className="space-y-4">
                  {spots.map((spot) => (
                    <SpotCard
                      key={spot.id}
                      spot={spot}
                      onViewDetails={() => {
                        // Navigate to spot details
                        router.push(`/spots/${spot.id}`);
                      }}
                      compact
                    />
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div> */}

      <div className="flex-1 flex">
        {/* Map View */}
        {viewMode === "map" && (
          // <div className="flex-1 relative">
          <>
            <MapView
              spots={spots}
              events={events}
              onSpotClick={handleSpotClick}
              onEventClick={handleEventClick}
              onMapClick={handleMapClick}
              center={userLocation || { lat: 37.7749, lng: -122.4194 }} // Default to SF if no user location
              zoom={12}
              enableSpotCreation={true}
              height="100%"
              userData={userLocation} // Pass user location for future use
              showEvents={showEvents}
            />

            {/* Selected Spot Card Overlay */}
            {selectedSpot && (
              <div className="absolute bottom-18 left-2 right-2 z-10 sm:left-4 sm:right-auto sm:max-w-sm">
                <SpotCard
                  spot={selectedSpot}
                  onViewDetails={() => {
                    router.push(`/spots/${selectedSpot.id}`);
                  }}
                  compact
                />
              </div>
            )}

            {/* Selected Event Card Overlay */}
            {selectedEvent && (
              <div className="absolute bottom-4 left-4 right-4 z-10 sm:left-4 sm:right-auto sm:max-w-sm">
                <EventCard
                  event={selectedEvent}
                  onViewDetails={() => {
                    router.push(`/events/${selectedEvent.id}`);
                  }}
                  onJoinEvent={() => {
                    // TODO: Implement join event functionality
                    console.log("Join event:", selectedEvent.id);
                  }}
                  compact
                />
              </div>
            )}
          </>
          // </div>
        )}

        {/* List View (Desktop) */}
        {viewMode === "list" && (
          <div className="flex-1 p-4 overflow-y-auto hidden sm:block">
            <div className="max-w-4xl mx-auto space-y-4">
              <h2 className="text-xl font-semibold">
                Nearby Spots ({spots.length})
              </h2>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {spots.map((spot) => (
                  <SpotCard
                    key={spot.id}
                    spot={spot}
                    onViewDetails={() => {
                      router.push(`/spots/${spot.id}`);
                    }}
                  />
                ))}
              </div>

              {spots.length === 0 && (
                <Card className="p-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">No spots found</h3>
                  <p className="text-muted-foreground">
                    Be the first to add a longboarding spot in this area!
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}