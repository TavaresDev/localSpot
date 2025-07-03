"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin } from "lucide-react";
import { Spot } from "@/lib/types/spots";

const spotFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(1000).optional(),
  locationLat: z.number().min(-90).max(90),
  locationLng: z.number().min(-180).max(180),
  spotType: z.enum(["hill", "street", "park", "bowl", "vert", "cruising", "distance"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  visibility: z.enum(["public", "private", "friends"]),
  startLat: z.number().min(-90).max(90).optional(),
  startLng: z.number().min(-180).max(180).optional(),
  endLat: z.number().min(-90).max(90).optional(),
  endLng: z.number().min(-180).max(180).optional(),
  bestTimes: z.string().max(500).optional(),
  safetyNotes: z.string().max(1000).optional(),
  rules: z.string().max(1000).optional(),
});

type SpotFormData = z.infer<typeof spotFormSchema>;

interface SpotFormProps {
  initialData?: Partial<Spot>;
  onSubmit: (data: SpotFormData) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

export function SpotForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isEditing = false,
  isSubmitting = false 
}: SpotFormProps) {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const form = useForm<SpotFormData>({
    resolver: zodResolver(spotFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      locationLat: initialData?.locationLat ? parseFloat(initialData.locationLat) : 0,
      locationLng: initialData?.locationLng ? parseFloat(initialData.locationLng) : 0,
      spotType: initialData?.spotType || "street",
      difficulty: initialData?.difficulty || "intermediate",
      visibility: initialData?.visibility || "public",
      startLat: initialData?.startLat ? parseFloat(initialData.startLat) : undefined,
      startLng: initialData?.startLng ? parseFloat(initialData.startLng) : undefined,
      endLat: initialData?.endLat ? parseFloat(initialData.endLat) : undefined,
      endLng: initialData?.endLng ? parseFloat(initialData.endLng) : undefined,
      bestTimes: initialData?.bestTimes || "",
      safetyNotes: initialData?.safetyNotes || "",
      rules: initialData?.rules || "",
    },
  });

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setIsLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("locationLat", position.coords.latitude);
        form.setValue("locationLng", position.coords.longitude);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to get your location. Please enter coordinates manually.");
        setIsLoadingLocation(false);
      }
    );
  };

  const setCurrentAsStart = () => {
    const lat = form.getValues("locationLat");
    const lng = form.getValues("locationLng");
    form.setValue("startLat", lat);
    form.setValue("startLng", lng);
  };

  const setCurrentAsEnd = () => {
    const lat = form.getValues("locationLat");
    const lng = form.getValues("locationLng");
    form.setValue("endLat", lat);
    form.setValue("endLng", lng);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Spot" : "Create New Spot"}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spot Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter spot name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe this spot..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="spotType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hill">🏔️ Hill</SelectItem>
                          <SelectItem value="street">🛣️ Street</SelectItem>
                          <SelectItem value="park">🏞️ Park</SelectItem>
                          <SelectItem value="bowl">🥣 Bowl</SelectItem>
                          <SelectItem value="vert">📐 Vert</SelectItem>
                          <SelectItem value="cruising">🛴 Cruising</SelectItem>
                          <SelectItem value="distance">📏 Distance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">🟢 Beginner</SelectItem>
                          <SelectItem value="intermediate">🟡 Intermediate</SelectItem>
                          <SelectItem value="advanced">🟠 Advanced</SelectItem>
                          <SelectItem value="expert">🔴 Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">🌍 Public</SelectItem>
                        <SelectItem value="friends">👥 Friends Only</SelectItem>
                        <SelectItem value="private">🔒 Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Who can see this spot
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Location</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={isLoadingLocation}
                >
                  {isLoadingLocation ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="mr-2 h-4 w-4" />
                  )}
                  Use Current Location
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="locationLat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="37.7749"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locationLng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="-122.4194"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Route Points */}
              <div className="space-y-3">
                <h4 className="font-medium">Route Points (Optional)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Start Point</label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={setCurrentAsStart}
                      >
                        Use Current
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="startLat"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="any"
                                placeholder="Lat"
                                {...field}
                                onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="startLng"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="any"
                                placeholder="Lng"
                                {...field}
                                onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">End Point</label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={setCurrentAsEnd}
                      >
                        Use Current
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="endLat"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="any"
                                placeholder="Lat"
                                {...field}
                                onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="endLng"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="any"
                                placeholder="Lng"
                                {...field}
                                onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              
              <FormField
                control={form.control}
                name="bestTimes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Best Times</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Early morning, weekends, avoid rush hour..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="safetyNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Safety Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Important safety information, hazards, traffic warnings..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rules & Guidelines</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Local rules, etiquette, or guidelines..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Spot" : "Create Spot"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}