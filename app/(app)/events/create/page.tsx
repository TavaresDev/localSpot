"use client";

import { useRouter } from "next/navigation";
import { EventForm } from "@/components/events/event-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Event } from "@/lib/types/spots";
import SpotFormErrorBoundary from "@/components/error-boundaries/spot-form-error-boundary";

export default function CreateEventPage() {
  const router = useRouter();

  const handleSuccess = (data: Event) => {
    // Redirect to the new event details or back to events list
    router.push(`/events/${data.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center space-x-4">
            <Link href="/events">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Create New Event</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 py-8">
        <SpotFormErrorBoundary>
          <EventForm
            onSubmit={handleSuccess}
            onCancel={handleCancel}
            fieldConfig={{
              showRecurrence: true,
              showPhotos: true,
              showAdvancedFields: true,
            }}
          />
        </SpotFormErrorBoundary>
      </div>
    </div>
  );
}