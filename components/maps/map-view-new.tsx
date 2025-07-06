"use client";

import { Map, AdvancedMarker, Pin, MapCameraChangedEvent, MapCameraProps } from "@vis.gl/react-google-maps";
import { SpotWithUser, EventWithSpot } from "@/lib/types/spots";
import { SpotCreationModal } from "./spot-creation-modal";
import { useState, useCallback, useEffect } from "react";

interface MapViewProps {
  spots: SpotWithUser[];
  events?: EventWithSpot[];
  onSpotClick?: (spot: SpotWithUser) => void;
  onEventClick?: (event: EventWithSpot) => void;
  onMapClick?: (lat: number, lng: number) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  enableSpotCreation?: boolean;
  height?: string;
  className?: string;
  userData?: { lat: number; lng: number } | null; // Optional user location for future use
  showEvents?: boolean; // Toggle event markers visibility
}

export function MapView({
  spots,
  events = [],
  onSpotClick,
  onEventClick,
  onMapClick,
  center = { lat: 37.7749, lng: -122.4194 }, // Default to SF
  zoom = 12,
  enableSpotCreation = false,
  height = "400px",
  className = "",
  userData, // Optional user location for future use
  showEvents = true,
}: MapViewProps) {
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [creationLocation, setCreationLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Controlled map state
  const [cameraProps, setCameraProps] = useState<MapCameraProps>({
    center: center,
    zoom: zoom,
  });

  // Update map center when user location changes
  useEffect(() => {
    if (userData) {
      setCameraProps(prev => ({
        ...prev,
        center: userData,
        zoom: 15, // Zoom in on user location
      }));
    }
  }, [userData]);

  const handleMapClick = useCallback((event: any) => {
    if (!enableSpotCreation) return;

    const lat = event.detail.latLng?.lat;
    const lng = event.detail.latLng?.lng;

    if (lat && lng) {
      onMapClick?.(lat, lng);
    }
  }, [enableSpotCreation, onMapClick]);

  const handleMapDoubleClick = useCallback((event: any) => {
    if (!enableSpotCreation) return;

    const lat = event.detail.latLng?.lat;
    const lng = event.detail.latLng?.lng;

    if (lat && lng) {
      setCreationLocation({ lat, lng });
      setShowCreationModal(true);
    }
  }, [enableSpotCreation]);

  const handleSpotCreated = useCallback(() => {
    setShowCreationModal(false);
    setCreationLocation(null);
  }, []);

  const handleCameraChange = useCallback((event: MapCameraChangedEvent) => {
    setCameraProps(event.detail);
  }, []);


  const mapId = "bfce0e8c4d24a6df6074c4b2"; // Example map ID, replace with your actual map ID

  return (
    <>
      <div className={`w-full ${className}`} style={{ height, minHeight: "400px" }}>
        <Map
          {...cameraProps}
          onCameraChanged={handleCameraChange}
          mapId={mapId}
          onClick={handleMapClick}
          onDblclick={handleMapDoubleClick}
          gestureHandling="greedy"
          disableDefaultUI={false}
        // styles={[
        //   {
        //     featureType: "poi",
        //     elementType: "labels",
        //     stylers: [{ visibility: "off" }],
        //   },
        // ]}
        >
          {spots.map((spot) => (
            <AdvancedMarker
              key={`spot-${spot.id}`}
              position={{
                lat: parseFloat(spot.locationLat.toString()),
                lng: parseFloat(spot.locationLng.toString()),
              }}
              onClick={() => onSpotClick?.(spot)}
              title={spot.name}
            >
              <Pin
                background={getSpotTypeColor(spot.spotType)}
                borderColor="white"
                glyphColor="white"
                scale={1.2}
              >
                <div className="text-sm">
                  {getSpotTypeEmoji(spot.spotType)}
                </div>
              </Pin>
            </AdvancedMarker>
          ))}

          {showEvents && events.map((event) => (
            <AdvancedMarker
              key={`event-${event.id}`}
              position={{
                lat: parseFloat(event.spot.locationLat.toString()),
                lng: parseFloat(event.spot.locationLng.toString()),
              }}
              onClick={() => onEventClick?.(event)}
              title={`${event.title} - ${event.spot.name}`}
            >
              <Pin
                background={getEventStatusColor(event)}
                borderColor="white"
                glyphColor="white"
                scale={1.3}
              >
                <div className="text-sm">
                  {getEventStatusEmoji(event)}
                </div>
              </Pin>
            </AdvancedMarker>
          ))}
        </Map>
      </div>

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

function getEventStatusColor(event: EventWithSpot): string {
  const now = new Date();
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);

  // Event is happening now
  if (now >= startTime && now <= endTime) {
    return "#22C55E"; // Green - happening now
  }

  // Event is today
  if (startTime.toDateString() === now.toDateString()) {
    return "#3B82F6"; // Blue - today
  }

  // Event is past
  if (startTime < now) {
    return "#6B7280"; // Gray - past
  }

  // Event is upcoming
  return "#F59E0B"; // Orange - upcoming
}

function getEventStatusEmoji(event: EventWithSpot): string {
  const now = new Date();
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);

  // Event is happening now
  if (now >= startTime && now <= endTime) {
    return "🟢"; // Green circle - happening now
  }

  // Event is today
  if (startTime.toDateString() === now.toDateString()) {
    return "📅"; // Calendar - today
  }

  // Event is past
  if (startTime < now) {
    return "⏰"; // Clock - past
  }

  // Event is upcoming
  return "🔔"; // Bell - upcoming
}