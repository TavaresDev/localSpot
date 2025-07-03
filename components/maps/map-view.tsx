"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useGoogleMaps } from "@/lib/hooks/use-google-maps";
import { SpotWithUser } from "@/lib/types/spots";
import { SpotCreationModal } from "./spot-creation-modal";
import { Loader2 } from "lucide-react";

interface MapViewProps {
  spots: SpotWithUser[];
  onSpotClick?: (spot: SpotWithUser) => void;
  onMapClick?: (lat: number, lng: number) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  enableSpotCreation?: boolean;
  height?: string;
  className?: string;
}

export function MapView({
  spots,
  onSpotClick,
  onMapClick,
  center = { lat: 37.7749, lng: -122.4194 }, // Default to SF
  zoom = 12,
  enableSpotCreation = false,
  height = "400px",
  className = "",
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [creationLocation, setCreationLocation] = useState<{ lat: number; lng: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [AdvancedMarkerElement, setAdvancedMarkerElement] = useState<any>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError, google } = useGoogleMaps({
    apiKey: apiKey || "",
    libraries: ["places", "geometry", "marker"],
  });


  // Initialize map
  useEffect(() => {
    if (!isLoaded || !google?.maps || !mapRef.current || googleMapRef.current) {
      return;
    }

    // Double check that Google Maps is fully loaded
    if (!google.maps.Map) {
      console.warn("Google Maps not fully loaded yet");
      return;
    }

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapId: "DEMO_MAP_ID", // Required for Advanced Markers
      mapTypeId: "roadmap",
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    googleMapRef.current = map;

    // Import the marker library
    google.maps.importLibrary("marker").then((markerLib: any) => {
      setAdvancedMarkerElement(() => markerLib.AdvancedMarkerElement);
    }).catch((error) => {
      console.error("Failed to load marker library:", error);
    });

    // Add click listener for spot creation
    if (enableSpotCreation) {
      let clickTimeout: NodeJS.Timeout;
      
      map.addListener("click", (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          
          // Clear any existing timeout
          if (clickTimeout) {
            clearTimeout(clickTimeout);
          }
          
          // Set a timeout to distinguish between click and long press
          clickTimeout = setTimeout(() => {
            onMapClick?.(lat, lng);
          }, 100);
        }
      });

      // Add long press listener for mobile
      
      map.addListener("mousedown", (event: google.maps.MapMouseEvent) => {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
        }
        
        longPressTimerRef.current = setTimeout(() => {
          if (event.latLng) {
            setCreationLocation({
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
            });
            setShowCreationModal(true);
          }
        }, 500); // 500ms for long press
      });

      map.addListener("mouseup", () => {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      });
    }
  }, [isLoaded, google, center, zoom, enableSpotCreation, onMapClick]);

  // Update map markers when spots change
  useEffect(() => {
    if (!googleMapRef.current || !google?.maps || !isLoaded || !AdvancedMarkerElement) {
      return;
    }

    const map = googleMapRef.current;
    const markers = markersRef.current;

    // Clear existing markers
    markers.forEach(marker => {
      if (marker.map) {
        marker.map = null; // AdvancedMarkerElement cleanup
      }
    });
    markers.clear();

    // Add new markers using AdvancedMarkerElement
    spots.forEach(spot => {
      console.log("Creating advanced marker for spot:", spot.name);
      
      // Create custom pin element for the marker
      const pin = document.createElement('div');
      pin.style.width = '32px';
      pin.style.height = '32px';
      pin.style.borderRadius = '50%';
      pin.style.backgroundColor = getSpotTypeColor(spot.spotType);
      pin.style.border = '2px solid white';
      pin.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      pin.style.display = 'flex';
      pin.style.alignItems = 'center';
      pin.style.justifyContent = 'center';
      pin.style.fontSize = '16px';
      pin.innerHTML = getSpotTypeEmoji(spot.spotType);

      const marker = new AdvancedMarkerElement({
        map,
        position: {
          lat: parseFloat(spot.locationLat),
          lng: parseFloat(spot.locationLng),
        },
        content: pin,
        title: spot.name,
      });

      marker.addListener("click", () => {
        onSpotClick?.(spot);
      });

      markers.set(spot.id, marker);
    });
  }, [spots, google, isLoaded, onSpotClick, AdvancedMarkerElement]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const handleSpotCreated = useCallback(() => {
    setShowCreationModal(false);
    setCreationLocation(null);
    // Refresh spots would be handled by parent component
  }, []);

  if (!apiKey) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <h3 className="text-lg font-semibold">Maps Not Available</h3>
          <p className="text-muted-foreground">Google Maps API key not configured</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <h3 className="text-lg font-semibold">Failed to Load Map</h3>
          <p className="text-muted-foreground">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        ref={mapRef} 
        className={`w-full ${className}`} 
        style={{ height, minHeight: "400px", backgroundColor: "#f0f0f0" }}
      />
      
      {showCreationModal && creationLocation && (
        <SpotCreationModal
          isOpen={showCreationModal}
          onClose={() => setShowCreationModal(false)}
          location={creationLocation}
          onSpotCreated={handleSpotCreated}
        />
      )}
    </>
  );
}

function getSpotTypeColor(spotType: string): string {
  const colorMap: Record<string, string> = {
    downhill: "#EF4444",
    freeride: "#F59E0B", 
    freestyle: "#8B5CF6",
    cruising: "#10B981",
    dancing: "#EC4899",
    pumping: "#06B6D4",
  };
  return colorMap[spotType] || "#3B82F6";
}

function getSpotTypeEmoji(spotType: string): string {
  const emojiMap: Record<string, string> = {
    downhill: "🏔️",
    freeride: "🛣️", 
    freestyle: "🛴",
    cruising: "🏞️",
    dancing: "💃",
    pumping: "⚡",
  };
  return emojiMap[spotType] || "📍";
}