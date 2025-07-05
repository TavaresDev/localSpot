"use client";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function ManageSubscription() {
  return (
    <Button
      variant="outline"
      disabled
      onClick={() => {
        // Payment features disabled - SpotMap is free
      }}
    >
      <ExternalLink className="h-4 w-4 mr-2" />
      Manage Subscription
    </Button>
  );
}
