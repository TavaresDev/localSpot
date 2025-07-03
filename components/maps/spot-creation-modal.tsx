"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SPOT_TYPES, SPOT_DIFFICULTIES, SPOT_VISIBILITIES } from "@/lib/types/spots";
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
import { Loader2, MapPin } from "lucide-react";

const spotCreationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(1000).optional(),
  spotType: z.enum(SPOT_TYPES),
  difficulty: z.enum(SPOT_DIFFICULTIES),
  visibility: z.enum(SPOT_VISIBILITIES).default("public"),
  bestTimes: z.string().max(500).optional(),
  safetyNotes: z.string().max(1000).optional(),
  rules: z.string().max(1000).optional(),
});

type SpotCreationForm = z.infer<typeof spotCreationSchema>;

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SpotCreationForm>({
    resolver: zodResolver(spotCreationSchema),
    defaultValues: {
      name: "",
      description: "",
      spotType: "cruising",
      difficulty: "intermediate",
      visibility: "public",
      bestTimes: "",
      safetyNotes: "",
      rules: "",
    },
  });

  const onSubmit = async (data: SpotCreationForm) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/spots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          locationLat: location.lat,
          locationLng: location.lng,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create spot");
      }

      onSpotCreated?.();
      onClose();
      form.reset();
    } catch (error) {
      console.error("Failed to create spot:", error);
      // In a real app, you'd show a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Spot</DialogTitle>
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      className="min-h-[80px]"
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
                        <SelectItem value="downhill">🏔️ Downhill</SelectItem>
                        <SelectItem value="freeride">🛣️ Freeride</SelectItem>
                        <SelectItem value="freestyle">🛴 Freestyle</SelectItem>
                        <SelectItem value="cruising">🏞️ Cruising</SelectItem>
                        <SelectItem value="dancing">💃 Dancing</SelectItem>
                        <SelectItem value="pumping">⚡ Pumping</SelectItem>
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

            <FormField
              control={form.control}
              name="bestTimes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Best Times</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Early morning, weekends..." 
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
                      placeholder="Important safety information..."
                      className="min-h-[60px]"
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
                  <FormLabel>Rules</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Local rules or guidelines..."
                      className="min-h-[60px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Spot
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}