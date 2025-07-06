"use client";

import { useState, useEffect } from "react";
import { useEventForm, UseEventFormOptions } from "@/lib/hooks/useEventForm";
import { SpotWithUser } from "@/lib/types/spots";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, Repeat, MapPin, Upload, X } from "lucide-react";

interface EventFormProps extends UseEventFormOptions {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  availableSpots?: SpotWithUser[];
  selectedSpotId?: string;
}

export function EventForm({ 
  onSubmit, 
  onCancel, 
  availableSpots = [],
  selectedSpotId,
  ...formOptions 
}: EventFormProps) {
  const [spots, setSpots] = useState<SpotWithUser[]>(availableSpots);
  const [loadingSpots, setLoadingSpots] = useState(false);
  
  const { 
    form, 
    isSubmitting, 
    error,
    result,
    handleSubmit,
    clearResult,
    fieldConfig,
    generateRecurrenceText
  } = useEventForm({
    ...formOptions,
    onSuccess: onSubmit,
    initialData: {
      ...formOptions.initialData,
      spotId: selectedSpotId || formOptions.initialData?.spotId
    }
  });

  // Load user's accessible spots if not provided
  useEffect(() => {
    if (availableSpots.length === 0) {
      fetchUserSpots();
    }
  }, [availableSpots.length]);

  const fetchUserSpots = async () => {
    try {
      setLoadingSpots(true);
      // Get user's spots + public approved spots for events
      const response = await fetch('/api/spots?visibility=public&status=approved');
      if (response.ok) {
        const data = await response.json();
        setSpots(data.spots || []);
      }
    } catch (error) {
      console.error("Error fetching spots:", error);
    } finally {
      setLoadingSpots(false);
    }
  };

  const isRecurring = form.watch("isRecurring");
  const recurrenceData = form.watch("recurrenceData");
  const selectedSpot = spots.find(spot => spot.id === form.watch("spotId"));

  // Generate default end time when start time changes
  const handleStartTimeChange = (startTime: string) => {
    if (startTime) {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours
      const endTimeString = end.toISOString().slice(0, 16); // Format for datetime-local
      form.setValue("endTime", endTimeString);
    }
  };

  const getSpotTypeIcon = (spotType: string) => {
    switch (spotType) {
      case "downhill": return "🏔️";
      case "freeride": return "🛣️";
      case "freestyle": return "🛴";
      case "cruising": return "🏞️";
      case "dancing": return "💃";
      case "pumping": return "⚡";
      default: return "📍";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500 text-white";
      case "intermediate": return "bg-yellow-500 text-white";
      case "advanced": return "bg-orange-500 text-white";
      case "expert": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="space-y-6">
      {/* Result Messages */}
      {result && (
        <div className={`p-4 rounded-lg ${result.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          <div className="flex justify-between items-center">
            <span>{result.message}</span>
            <Button variant="ghost" size="sm" onClick={clearResult}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={handleSubmit()} className="space-y-6">
          
          {/* Event Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Weekly Downhill Session" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Spot Selection */}
          <FormField
            control={form.control}
            name="spotId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location (Spot)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingSpots ? "Loading spots..." : "Select a spot"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {spots.map((spot) => (
                      <SelectItem key={spot.id} value={spot.id}>
                        <div className="flex items-center space-x-2">
                          <span>{getSpotTypeIcon(spot.spotType)}</span>
                          <span>{spot.name}</span>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getDifficultyColor(spot.difficulty)}`}
                          >
                            {spot.difficulty}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {selectedSpot && (
                  <div className="mt-2 p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">{selectedSpot.name}</span>
                    </div>
                    {selectedSpot.description && (
                      <p className="text-sm text-muted-foreground">
                        {selectedSpot.description}
                      </p>
                    )}
                  </div>
                )}
              </FormItem>
            )}
          />

          {/* Event Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleStartTimeChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Recurrence Settings */}
          {fieldConfig?.showRecurrence && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Repeat className="mr-2 h-5 w-5" />
                  Recurring Event
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Make this a recurring event
                        </FormLabel>
                        <FormDescription>
                          Event will repeat based on your schedule
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {isRecurring && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="recurrenceData.frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequency</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="recurrenceData.interval"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Every</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="12" 
                                placeholder="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="recurrenceData.endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            Leave blank for indefinite recurrence
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {recurrenceData && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          📅 {generateRecurrenceText(recurrenceData)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Event Description */}
          {fieldConfig?.showAdvancedFields && (
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell people what to expect at this event..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Include details about skill requirements, what to bring, meeting points, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Photo Upload */}
          {fieldConfig?.showPhotos && (
            <FormField
              control={form.control}
              name="photos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Photos (Optional)</FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Photo upload coming soon
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Add photos to make your event more attractive
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting 
                ? (formOptions.isEditing ? 'Updating Event...' : 'Creating Event...') 
                : (formOptions.isEditing ? 'Update Event' : 'Create Event')
              }
            </Button>
            
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1 sm:flex-initial"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}