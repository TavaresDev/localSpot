"use client";

import { useState, useEffect } from "react";
import { MapView } from "@/components/maps/map-view-new";
import { SpotCard } from "@/components/spots/spot-card";
import { SpotWithUser } from "@/lib/types/spots";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MapIcon, List } from "lucide-react";

export default function MapPage() {
  const [spots, setSpots] = useState<SpotWithUser[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<SpotWithUser | null>(null);
  const [spotsLoading, setSpotsLoading] = useState(true);
  const [spotsError, setSpotsError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  // Get user location (non-blocking)
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Error getting location:", error);
            // Default to San Francisco
            setUserLocation({ lat: 37.7749, lng: -122.4194 });
          }
        );
      } else {
        setUserLocation({ lat: 37.7749, lng: -122.4194 });
      }
    };

    getUserLocation();
  }, []);

  // Fetch spots immediately (parallel to other loading)
  useEffect(() => {
    async function fetchSpots() {
      try {
        setSpotsLoading(true);
        setSpotsError(null);

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
        setSpotsError("Failed to load spots");
      } finally {
        setSpotsLoading(false);
      }
    }

    fetchSpots();
  }, []); // Remove userLocation dependency to start loading immediately

  const handleSpotClick = (spot: SpotWithUser) => {
    setSelectedSpot(spot);
  };

  const handleMapClick = () => {
    setSelectedSpot(null);
  };

  // Use default location if user location is not available
  // const mapCenter =

  return (
    <div className="h-screen md:h-[100dvh] flex flex-col">
      {/* Header */}
      <div className="bg-background border-b p-4 flex items-center justify-between">
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

          {/* Mobile Sheet for spots list */}
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
                        window.location.href = `/spots/${spot.id}`;
                      }}
                      compact
                    />
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Map View */}
        {viewMode === "map" && (
          // <div className="flex-1 relative">
          <>
            <MapView
              spots={spots}
              onSpotClick={handleSpotClick}
              onMapClick={handleMapClick}
              center={userLocation || { lat: 37.7749, lng: -122.4194 }} // Default to SF if no user location
              zoom={12}
              enableSpotCreation={true}
              height="100%"
              userData={userLocation} // Pass user location for future use
            />

            {/* Selected Spot Card Overlay */}
            {selectedSpot && (
              <div className="absolute bottom-4 left-4 right-4 z-10 sm:left-4 sm:right-auto sm:max-w-sm">
                <SpotCard
                  spot={selectedSpot}
                  onViewDetails={() => {
                    window.location.href = `/spots/${selectedSpot.id}`;
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
                      window.location.href = `/spots/${spot.id}`;
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