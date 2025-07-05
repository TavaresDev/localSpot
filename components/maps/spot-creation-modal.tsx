"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { Loader2, MapPin } from "lucide-react";
import { useSpotForm } from "@/lib/hooks/useSpotForm";
import { SPOT_TYPES, SPOT_DIFFICULTIES } from "@/lib/types/spots";
import { authClient } from "@/lib/auth-client";

interface SpotCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: { lat: number; lng: number };
  onSpotCreated?: () => void;
}

export function SpotCreationModal({
  isOpen,
  onClose,
  location,
  onSpotCreated,
}: SpotCreationModalProps) {
  const { data: session } = authClient.useSession();
  
  const { 
    form, 
    isSubmitting, 
    error,
    handleSubmit 
  } = useSpotForm({
    initialData: { 
      locationLat: location.lat, 
      locationLng: location.lng,
      visibility: "public" // Default for quick creation
    },
    onSuccess: () => {
      onSpotCreated?.();
      onClose();
    },
    onError: (error) => {
      // Handle authentication errors specifically
      if (error.includes("Authentication required") || error.includes("UNAUTHORIZED")) {
        // Could show a login prompt or redirect
        console.error("User needs to be logged in to create spots");
      }
    },
    fieldConfig: {
      showRoutePoints: false,        // Hide complex route fields for mobile
      showAdvancedFields: false,     // Hide rules, visibility for simplicity
      showLocationHelpers: false,    // Location comes from map click
    }
  });
  
  // Show login prompt if not authenticated
  if (!session?.user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to create spots
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-3 pt-4">
            <Button 
              onClick={() => authClient.signIn.social({ provider: "google" })}
              className="w-full h-12"
            >
              Sign in with Google
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full h-10"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle>Quick Spot Creation</DialogTitle>
          <DialogDescription>
            Add a new longboarding spot at this location
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
          <MapPin className="h-4 w-4" />
          <span>
            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit()} className="space-y-4">
            {/* Essential Fields Only - Mobile Optimized */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spot Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter spot name" 
                      className="h-12 text-base"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="spotType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SPOT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {getSpotTypeDisplay(type)}
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
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SPOT_DIFFICULTIES.map((difficulty) => (
                          <SelectItem key={difficulty} value={difficulty}>
                            {getDifficultyDisplay(difficulty)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of this spot..." 
                      className="min-h-[80px] text-base"
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
                  <FormLabel>Safety Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any safety warnings or important info..."
                      className="min-h-[60px] text-base"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col space-y-2 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 text-lg"
              >
                {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {isSubmitting ? 'Creating Spot...' : 'Create Spot'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="w-full h-10"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions for display formatting
function getSpotTypeDisplay(type: string): string {
  const displays: Record<string, string> = {
    downhill: "🏔️ Downhill",
    freeride: "🛣️ Freeride", 
    freestyle: "🛴 Freestyle",
    cruising: "🏞️ Cruising",
    dancing: "💃 Dancing",
    pumping: "⚡ Pumping",
  };
  return displays[type] || type;
}

function getDifficultyDisplay(difficulty: string): string {
  const displays: Record<string, string> = {
    beginner: "🟢 Beginner",
    intermediate: "🟡 Intermediate", 
    advanced: "🟠 Advanced",
    expert: "🔴 Expert",
  };
  return displays[difficulty] || difficulty;
}