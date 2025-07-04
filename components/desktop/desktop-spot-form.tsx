"use client";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import { Spot, SPOT_TYPES, SPOT_DIFFICULTIES, SPOT_VISIBILITIES } from "@/lib/types/spots";
import { useSpotForm, UseSpotFormOptions } from "@/lib/hooks/useSpotForm";
import { CreateSpotResponse } from "@/lib/services/spotService";

interface DesktopSpotFormProps {
  initialData?: Partial<Spot>;
  onSubmit?: (data: CreateSpotResponse | Spot) => void;
  onCancel?: () => void;
  isEditing?: boolean;
  fieldConfig?: UseSpotFormOptions["fieldConfig"];
}

export function DesktopSpotForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isEditing = false,
  fieldConfig = {
    showRoutePoints: true,
    showAdvancedFields: true,
    showLocationHelpers: true,
  }
}: DesktopSpotFormProps) {
  const {
    form,
    isSubmitting,
    result,
    handleSubmit,
    getCurrentLocation,
    setCurrentAsStart,
    setCurrentAsEnd,
    fieldConfig: config
  } = useSpotForm({
    isEditing,
    initialData,
    onSuccess: onSubmit,
    fieldConfig
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Longboarding Spot" : "Create New Longboarding Spot"}
          </CardTitle>
          <CardDescription>
            Fill in the details below to {isEditing ? "update" : "create"} a spot. 
            All required fields are marked with *.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit()} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Essential details about the longboarding spot
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-2">
                        <FormLabel>Spot Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Golden Gate Hill Bomb"
                            disabled={isSubmitting}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Spot Type and Difficulty */}
                  <FormField
                    control={form.control}
                    name="spotType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spot Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select spot type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SPOT_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </SelectItem>
                            ))}
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
                        <FormLabel>Difficulty *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SPOT_DIFFICULTIES.map((difficulty) => (
                              <SelectItem key={difficulty} value={difficulty}>
                                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Visibility - Desktop shows this prominently */}
                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-2">
                        <FormLabel>Visibility</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SPOT_VISIBILITIES.map((visibility) => (
                              <SelectItem key={visibility} value={visibility}>
                                {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Control who can see this spot in the app
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the spot, terrain, and what makes it special..."
                            className="min-h-[100px]"
                            disabled={isSubmitting}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Location Section */}
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Location</h3>
                      <p className="text-sm text-muted-foreground">
                        Precise coordinates and route information
                      </p>
                    </div>
                    {config?.showLocationHelpers && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={getCurrentLocation}
                        disabled={isSubmitting}
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Use Current Location
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="locationLat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="any"
                            placeholder="37.7749"
                            disabled={isSubmitting}
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
                        <FormLabel>Longitude *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="any"
                            placeholder="-122.4194"
                            disabled={isSubmitting}
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
                {config?.showRoutePoints && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Route Points (Optional)</h4>
                    <p className="text-sm text-muted-foreground">
                      Define start and end points for routes or runs
                    </p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Start Point */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Start Point</label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={setCurrentAsStart}
                            disabled={isSubmitting}
                          >
                            Use Current as Start
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name="startLat"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="any"
                                    placeholder="Start Lat"
                                    disabled={isSubmitting}
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
                                    placeholder="Start Lng"
                                    disabled={isSubmitting}
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

                      {/* End Point */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">End Point</label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={setCurrentAsEnd}
                            disabled={isSubmitting}
                          >
                            Use Current as End
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name="endLat"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="any"
                                    placeholder="End Lat"
                                    disabled={isSubmitting}
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
                                    placeholder="End Lng"
                                    disabled={isSubmitting}
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
                )}
              </div>

              {/* Additional Information Section */}
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold">Additional Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Safety notes, timing, and guidelines
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="bestTimes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Best Times to Ride</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Early morning, weekends, after 6pm"
                            disabled={isSubmitting}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div></div> {/* Empty grid cell for spacing */}

                  <FormField
                    control={form.control}
                    name="safetyNotes"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-2">
                        <FormLabel>Safety Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Important safety information, hazards, traffic warnings..."
                            className="min-h-[80px]"
                            disabled={isSubmitting}
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
                      <FormItem className="lg:col-span-2">
                        <FormLabel>Rules & Guidelines</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Local rules, etiquette, or guidelines..."
                            className="min-h-[80px]"
                            disabled={isSubmitting}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
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

      {/* Result Display */}
      {result && (
        <Alert className={result.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {result.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={result.type === "success" ? "text-green-800" : "text-red-800"}>
            {result.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Details */}
      {result?.type === "success" && result.data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">
              {isEditing ? "Updated" : "Created"} Spot Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">ID</dt>
                <dd className="font-mono">{result.data.id}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Name</dt>
                <dd>{result.data.name}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Type</dt>
                <dd className="capitalize">{result.data.spotType}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Difficulty</dt>
                <dd className="capitalize">{result.data.difficulty}</dd>
              </div>
              {('status' in result.data) && (
                <div>
                  <dt className="font-medium text-muted-foreground">Status</dt>
                  <dd className="capitalize">{result.data.status}</dd>
                </div>
              )}
              <div>
                <dt className="font-medium text-muted-foreground">{isEditing ? "Updated" : "Created"}</dt>
                <dd>{new Date(result.data.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}