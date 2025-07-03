"use client";

import { useState, useEffect } from "react";
import { MapView } from "@/components/maps/map-view";
import { SpotCard } from "@/components/spots/spot-card";
import { SpotWithUser } from "@/lib/types/spots";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Loader2, MapIcon, List } from "lucide-react";

export default function MapPage() {
  const [spots, setSpots] = useState<SpotWithUser[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<SpotWithUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  // Get user location
  useEffect(() => {
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
  }, []);

  // Fetch spots
  useEffect(() => {
    async function fetchSpots() {
      try {
        setIsLoading(true);
        
        const params = new URLSearchParams();
        if (userLocation) {
          // params.append("lat", userLocation.lat.toString());
          // params.append("lng", userLocation.lng.toString());
          // params.append("radius", "50000"); // 50km radius
          // params.append("sort", "distance");
        }
        
        const response = await fetch(`/api/spots?${params}`);
        if (!response.ok) throw new Error("Failed to fetch spots");
        
        const data = await response.json();
        setSpots(data.spots || []);
      } catch (error) {
        console.error("Error fetching spots:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (userLocation) {
      fetchSpots();
    }
  }, [userLocation]);

  const handleSpotClick = (spot: SpotWithUser) => {
    setSelectedSpot(spot);
  };

  const handleMapClick = () => {
    setSelectedSpot(null);
  };

  if (isLoading || !userLocation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
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
          <div className="flex-1 relative">
            <MapView
              spots={spots}
              onSpotClick={handleSpotClick}
              onMapClick={handleMapClick}
              center={userLocation}
              zoom={12}
              enableSpotCreation={true}
              height="100%"
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
          </div>
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