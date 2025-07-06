"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  CreateEventForm, 
  Event, 
  RecurrenceData
} from "@/lib/types/spots";

// Single schema for all event form operations
const eventFormSchema = z.object({
  spotId: z.string().min(1, "Spot selection is required"),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(1000).optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  isRecurring: z.boolean(),
  recurrenceData: z.object({
    frequency: z.enum(["daily", "weekly", "monthly"]),
    interval: z.number().min(1).max(12),
    endDate: z.string().optional(),
  }).optional(),
  photos: z.array(z.string()),
});

// Update schema (all fields optional)
const updateEventFormSchema = eventFormSchema.partial();

type EventFormData = z.infer<typeof eventFormSchema>;
type UpdateEventFormData = z.infer<typeof updateEventFormSchema>;

export interface UseEventFormOptions {
  isEditing?: boolean;
  initialData?: Partial<Event>;
  onSuccess?: (data: Event) => void;
  onError?: (error: string) => void;
  // Field visibility configuration for different contexts
  fieldConfig?: {
    showRecurrence?: boolean; // recurrence options
    showPhotos?: boolean; // photo upload
    showAdvancedFields?: boolean; // description, etc.
  };
}

export interface UseEventFormReturn {
  form: ReturnType<typeof useForm<EventFormData>>;
  isSubmitting: boolean;
  error: string | null;
  result: { type: "success" | "error"; message: string; data?: Event } | null;
  handleSubmit: (onSubmit?: (data: Event) => void) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  clearResult: () => void;
  validateForm: () => string | null;
  fieldConfig: Required<UseEventFormOptions["fieldConfig"]>;
  generateRecurrenceText: (recurrenceData?: RecurrenceData) => string;
}

// Event-specific service functions
class EventService {
  static async createEvent(eventData: CreateEventForm): Promise<Event> {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create event');
    }

    return response.json();
  }

  static async updateEvent(eventId: string, eventData: Partial<CreateEventForm>): Promise<Event> {
    const response = await fetch(`/api/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update event');
    }

    return response.json();
  }
}

export function useEventForm(options: UseEventFormOptions = {}): UseEventFormReturn {
  const {
    isEditing = false,
    initialData,
    onSuccess,
    onError,
    fieldConfig = {}
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UseEventFormReturn["result"]>(null);

  // Default field configuration - show all features by default
  const defaultFieldConfig = {
    showRecurrence: true,
    showPhotos: true,
    showAdvancedFields: true,
    ...fieldConfig
  };

  // Helper function to format date for datetime-local input
  const formatDateTimeLocal = (date: Date | string | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    
    // Format as YYYY-MM-DDTHH:mm (datetime-local format)
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      spotId: initialData?.spotId || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      startTime: formatDateTimeLocal(initialData?.startTime) || "",
      endTime: formatDateTimeLocal(initialData?.endTime) || "",
      isRecurring: initialData?.isRecurring ?? false,
      recurrenceData: initialData?.recurrenceData ? {
        frequency: (initialData.recurrenceData as any)?.frequency || "weekly",
        interval: (initialData.recurrenceData as any)?.interval || 1,
        endDate: (initialData.recurrenceData as any)?.endDate || "",
      } : {
        frequency: "weekly" as const,
        interval: 1,
        endDate: "",
      },
      photos: (initialData?.photos as string[]) || [],
    },
  });

  const validateForm = (): string | null => {
    const values = form.getValues();
    
    if (!values.title?.trim()) return "Title is required";
    if (!values.spotId) return "Spot selection is required";
    if (!values.startTime) return "Start time is required";
    if (!values.endTime) return "End time is required";
    
    // Validate time logic
    const startTime = new Date(values.startTime);
    const endTime = new Date(values.endTime);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return "Please provide valid start and end times";
    }
    
    if (startTime >= endTime) {
      return "Start time must be before end time";
    }
    
    // Validate past events (only for creation, not editing)
    if (!isEditing && startTime < new Date()) {
      return "Cannot create events in the past";
    }
    
    // Validate recurrence data if recurring
    if (values.isRecurring && !values.recurrenceData) {
      return "Recurrence settings are required for recurring events";
    }

    return null;
  };

  const generateRecurrenceText = (recurrenceData?: RecurrenceData): string => {
    if (!recurrenceData) return "";
    
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

  const clearResult = (): void => {
    setResult(null);
    setError(null);
  };

  const handleSubmit = (onSubmit?: (data: Event) => void) => {
    return form.handleSubmit(async (data: EventFormData) => {
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

        // Prepare payload
        const payload: CreateEventForm = {
          spotId: data.spotId,
          title: data.title.trim(),
          description: data.description?.trim() || undefined,
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          isRecurring: data.isRecurring,
          recurrenceData: data.isRecurring ? data.recurrenceData : undefined,
          photos: data.photos || [],
        };

        // Remove undefined values
        Object.keys(payload).forEach(key => {
          if (payload[key as keyof typeof payload] === undefined) {
            delete payload[key as keyof typeof payload];
          }
        });

        let response: Event;

        if (isEditing && initialData?.id) {
          response = await EventService.updateEvent(initialData.id, payload);
        } else {
          response = await EventService.createEvent(payload);
        }

        setResult({
          type: "success",
          message: isEditing ? "Event updated successfully!" : "Event created successfully!",
          data: response,
        });

        onSuccess?.(response);
        onSubmit?.(response);

        // Reset form only if creating (not editing)
        if (!isEditing) {
          form.reset();
        }

      } catch (error) {
        console.error("Error submitting event:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to submit event. Please try again.";
        
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
    clearResult,
    validateForm,
    fieldConfig: defaultFieldConfig,
    generateRecurrenceText,
  };
}