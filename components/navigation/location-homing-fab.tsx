"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Crosshair, Loader2 } from "lucide-react";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useMap } from "@vis.gl/react-google-maps";

export function LocationHomingFAB() {
  const pathname = usePathname();
  const { isLoading, refetchLocation } = useUserLocation();
  const map = useMap(); // Get Google Maps instance from context

  // Show FAB only on map page
  const showFAB = pathname === "/map";

  if (!showFAB) return null;

  const handleHomingClick = async () => {
    console.log("Refetching user location and re-centering map");

    try {
      const location = await refetchLocation();

      if (map && location) {
        // Directly control Google Maps instance
        map.panTo({ lat: location.lat, lng: location.lng });
        map.setZoom(15);
        console.log("Map centered to:", location);
      } else {
        console.warn("Map instance or location not available");
      }
    } catch (error) {
      console.error("Failed to center map on user location:", error);
    }
  };

  return (
    <Button
      onClick={handleHomingClick}
      disabled={isLoading}
      size={"lg"}
      className="fixed bottom-28 right-2 z-40 bg-secondary text-secondary-foreground rounded-full p-4 shadow-lg hover:bg-secondary/90 transition-colors lg:bottom-16"
    >
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <Crosshair className="h-8 w-8" />
      )}
      <span className="sr-only">Center map on my location</span>
    </Button>
  );
}