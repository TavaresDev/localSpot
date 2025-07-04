"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  CreateSpotForm, 
  Spot, 
  SpotType,
  SpotDifficulty,
  SpotVisibility,
  SPOT_TYPES, 
  SPOT_DIFFICULTIES, 
  SPOT_VISIBILITIES 
} from "@/lib/types/spots";
import { SpotService, CreateSpotResponse } from "@/lib/services/spotService";

// Create Zod schema using the correct constants from types
const createSpotFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(1000).optional(),
  locationLat: z.number().min(-90).max(90),
  locationLng: z.number().min(-180).max(180),
  spotType: z.enum(SPOT_TYPES),
  difficulty: z.enum(SPOT_DIFFICULTIES),
  visibility: z.enum(SPOT_VISIBILITIES),
  startLat: z.number().min(-90).max(90).optional(),
  startLng: z.number().min(-180).max(180).optional(),
  endLat: z.number().min(-90).max(90).optional(),
  endLng: z.number().min(-180).max(180).optional(),
  bestTimes: z.string().max(500).optional(),
  safetyNotes: z.string().max(1000).optional(),
  rules: z.string().max(1000).optional(),
});

const updateSpotFormSchema = createSpotFormSchema.partial();

type SpotFormData = z.infer<typeof createSpotFormSchema>;
type UpdateSpotFormData = z.infer<typeof updateSpotFormSchema>;

export interface UseSpotFormOptions {
  isEditing?: boolean;
  initialData?: Partial<Spot>;
  onSuccess?: (data: CreateSpotResponse | Spot) => void;
  onError?: (error: string) => void;
  // Field visibility configuration for different contexts
  fieldConfig?: {
    showRoutePoints?: boolean; // startLat, endLat fields
    showAdvancedFields?: boolean; // rules, visibility
    showLocationHelpers?: boolean; // GPS, map integration
  };
}

export interface UseSpotFormReturn {
  form: ReturnType<typeof useForm<SpotFormData>>;
  isSubmitting: boolean;
  error: string | null;
  result: { type: "success" | "error"; message: string; data?: CreateSpotResponse | Spot } | null;
  handleSubmit: (onSubmit?: (data: CreateSpotResponse | Spot) => void) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  getCurrentLocation: () => Promise<void>;
  setCurrentAsStart: () => void;
  setCurrentAsEnd: () => void;
  clearResult: () => void;
  validateForm: () => string | null;
  fieldConfig: Required<UseSpotFormOptions["fieldConfig"]>;
}

// Type guard functions
function isValidSpotType(value: unknown): value is SpotType {
  return typeof value === 'string' && SPOT_TYPES.includes(value as SpotType);
}

function isValidSpotDifficulty(value: unknown): value is SpotDifficulty {
  return typeof value === 'string' && SPOT_DIFFICULTIES.includes(value as SpotDifficulty);
}

function isValidSpotVisibility(value: unknown): value is SpotVisibility {
  return typeof value === 'string' && SPOT_VISIBILITIES.includes(value as SpotVisibility);
}

// Enhanced coordinate validation
function isValidCoordinate(lat: number, lng: number): boolean {
  // Check for realistic coordinate ranges
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return false;
  }
  
  // Check for obviously invalid coordinates (exact 0,0 is suspicious unless in Gulf of Guinea)
  if (lat === 0 && lng === 0) {
    return false;
  }
  
  // Check for other suspicious coordinates
  if (Math.abs(lat) < 0.001 && Math.abs(lng) < 0.001) {
    return false;
  }
  
  return true;
}

export function useSpotForm(options: UseSpotFormOptions = {}): UseSpotFormReturn {
  const {
    isEditing = false,
    initialData,
    onSuccess,
    onError,
    fieldConfig = {}
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UseSpotFormReturn["result"]>(null);

  // Default field configuration - mobile shows everything, desktop can be configured
  const defaultFieldConfig = {
    showRoutePoints: true,
    showAdvancedFields: true,
    showLocationHelpers: true,
    ...fieldConfig
  };

  const form = useForm<SpotFormData>({
    resolver: zodResolver(createSpotFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      locationLat: initialData?.locationLat || 0,
      locationLng: initialData?.locationLng || 0,
      spotType: isValidSpotType(initialData?.spotType) ? initialData.spotType : "cruising",
      difficulty: isValidSpotDifficulty(initialData?.difficulty) ? initialData.difficulty : "intermediate",
      visibility: isValidSpotVisibility(initialData?.visibility) ? initialData.visibility : "public",
      startLat: initialData?.startLat || undefined,
      startLng: initialData?.startLng || undefined,
      endLat: initialData?.endLat || undefined,
      endLng: initialData?.endLng || undefined,
      bestTimes: initialData?.bestTimes || "",
      safetyNotes: initialData?.safetyNotes || "",
      rules: initialData?.rules || "",
    },
  });

  const validateForm = (): string | null => {
    const values = form.getValues();
    
    if (!values.name?.trim()) return "Name is required";
    if (!values.spotType) return "Spot type is required";
    if (!values.difficulty) return "Difficulty is required";
    
    // Enhanced coordinate validation
    if (!isValidCoordinate(values.locationLat, values.locationLng)) {
      return "Please provide valid GPS coordinates. Check that latitude is between -90 and 90, longitude is between -180 and 180, and coordinates are not 0,0.";
    }
    
    // Validate route points if provided
    if (values.startLat !== undefined && values.startLng !== undefined) {
      if (!isValidCoordinate(values.startLat, values.startLng)) {
        return "Start point coordinates are invalid.";
      }
    }
    
    if (values.endLat !== undefined && values.endLng !== undefined) {
      if (!isValidCoordinate(values.endLat, values.endLng)) {
        return "End point coordinates are invalid.";
      }
    }

    return null;
  };

  const getCurrentLocation = async (): Promise<void> => {
    if (!navigator.geolocation) {
      const errorMsg = "Geolocation is not supported by this browser.";
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue("locationLat", position.coords.latitude);
          form.setValue("locationLng", position.coords.longitude);
          resolve();
        },
        (error) => {
          console.error("Error getting location:", error);
          const errorMsg = "Unable to get your location. Please enter coordinates manually.";
          setError(errorMsg);
          onError?.(errorMsg);
          reject(error);
        }
      );
    });
  };

  const setCurrentAsStart = (): void => {
    const lat = form.getValues("locationLat");
    const lng = form.getValues("locationLng");
    form.setValue("startLat", lat);
    form.setValue("startLng", lng);
  };

  const setCurrentAsEnd = (): void => {
    const lat = form.getValues("locationLat");
    const lng = form.getValues("locationLng");
    form.setValue("endLat", lat);
    form.setValue("endLng", lng);
  };

  const clearResult = (): void => {
    setResult(null);
    setError(null);
  };

  const handleSubmit = (onSubmit?: (data: CreateSpotResponse | Spot) => void) => {
    return form.handleSubmit(async (data: SpotFormData) => {
      setIsSubmitting(true);
      setError(null);
      setResult(null);

      try {
        // Client-side validation
        const validationError = validateForm();
        if (validationError) {
          setError(validationError);
          setResult({ type: "error", message: validationError });
          onError?.(validationError);
          return;
        }

        // Prepare payload - coordinates are now naturally numbers
        const payload: CreateSpotForm = {
          name: data.name.trim(),
          description: data.description?.trim() || undefined,
          locationLat: data.locationLat,
          locationLng: data.locationLng,
          spotType: data.spotType,
          difficulty: data.difficulty,
          visibility: data.visibility || "public",
          startLat: data.startLat,
          startLng: data.startLng,
          endLat: data.endLat,
          endLng: data.endLng,
          bestTimes: data.bestTimes?.trim() || undefined,
          safetyNotes: data.safetyNotes?.trim() || undefined,
          rules: data.rules?.trim() || undefined,
        };

        // Remove undefined values
        Object.keys(payload).forEach(key => {
          if (payload[key as keyof typeof payload] === undefined) {
            delete payload[key as keyof typeof payload];
          }
        });

        let response: CreateSpotResponse | Spot;

        if (isEditing && initialData?.id) {
          response = await SpotService.updateSpot(initialData.id, payload);
        } else {
          response = await SpotService.createSpot(payload);
        }

        setResult({
          type: "success",
          message: isEditing ? "Spot updated successfully!" : "Spot created successfully!",
          data: response,
        });

        onSuccess?.(response);
        onSubmit?.(response);

        // Reset form only if creating (not editing)
        if (!isEditing) {
          form.reset();
        }

      } catch (error) {
        console.error("Error submitting spot:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to submit spot. Please try again.";
        
        setError(errorMessage);
        setResult({ type: "error", message: errorMessage });
        onError?.(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  return {
    form,
    isSubmitting,
    error,
    result,
    handleSubmit,
    getCurrentLocation,
    setCurrentAsStart,
    setCurrentAsEnd,
    clearResult,
    validateForm,
    fieldConfig: defaultFieldConfig,
  };
}