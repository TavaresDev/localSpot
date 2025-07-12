"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SpotForm } from "@/components/spots/spot-form";
import { Business } from "@/lib/types/business";
import { CreateSpotResponse } from "@/lib/services/spotService";
import { Spot } from "@/lib/types/spots";

interface CreateSpotFromPlaceModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (spot: CreateSpotResponse | Spot) => void;
}

export function CreateSpotFromPlaceModal({
  business,
  isOpen,
  onClose,
  onSuccess
}: CreateSpotFromPlaceModalProps) {
  if (!business) return null;

  // Pre-fill form data from business information
  const initialData = {
    name: business.name,
    description: business.businessType ? `${business.businessType} found via Places search` : undefined,
    locationLat: business.location?.lat,
    locationLng: business.location?.lng,
    // Default to public visibility for places-created spots
    visibility: "public" as const,
    // Default to cruising type for general places
    spotType: "cruising" as const,
    difficulty: "beginner" as const,
    // Add Google Places photos as simple URL strings
    photos: business.photos?.slice(0, 3).map((photoRef) => 
      `/api/places/photo/${encodeURIComponent(photoRef)}?w=400&h=400`
    ) || []
  };

  console.log("Initial data for spot creation:", initialData);
  console.log("Business photos:", business.photos);

  const handleSubmit = (data: CreateSpotResponse | Spot) => {
    console.log("Spot created with data:", data);
    onSuccess?.(data);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📍 Create Spot from: {business.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {/* Business info preview */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Creating spot from place:
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p><strong>Name:</strong> {business.name}</p>
              {business.address && <p><strong>Address:</strong> {business.address}</p>}
              {business.businessType && <p><strong>Type:</strong> {business.businessType}</p>}
              {business.location && (
                <p>
                  <strong>Location:</strong> {business.location.lat.toFixed(6)}, {business.location.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Spot form with pre-filled data */}
          <SpotForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            fieldConfig={{
              showRoutePoints: false, // Keep it simple for place-based spots
              showAdvancedFields: true,
              showLocationHelpers: true, // Allow GPS usage
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}