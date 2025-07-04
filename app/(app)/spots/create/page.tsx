"use client";

import { useRouter } from "next/navigation";
import { SpotForm } from "@/components/spots/spot-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CreateSpotResponse } from "@/lib/services/spotService";
import { Spot } from "@/lib/types/spots";
import SpotFormErrorBoundary from "@/components/error-boundaries/spot-form-error-boundary";

export default function CreateSpotPage() {
  const router = useRouter();

  const handleSuccess = (data: CreateSpotResponse | Spot) => {
    // Redirect to the new spot
    // router.push(`/spots/${data.id}`); //no sopot page yet
    router.push(`/spots`);
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
            <Link href="/spots">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Create New Spot</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 py-8">
        <SpotFormErrorBoundary>
          <SpotForm
            onSubmit={handleSuccess}
            onCancel={handleCancel}
            fieldConfig={{
              showRoutePoints: true,
              showAdvancedFields: true,
              showLocationHelpers: true,
            }}
          />
        </SpotFormErrorBoundary>
      </div>
    </div>
  );
}