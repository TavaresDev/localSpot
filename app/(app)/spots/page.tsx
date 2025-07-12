"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SpotCard } from "@/components/spots/spot-card";
import { useSpots } from "@/lib/hooks/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, MapIcon } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { SpotService } from "@/lib/services/spotService";
import { toast } from "sonner";

export default function SpotsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [spotType, setSpotType] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Single hook call replaces all the fetch logic!
  const { data, isLoading, error, refetch } = useSpots({
    search: searchQuery || undefined,
    type: spotType !== "all" ? spotType : undefined,
    difficulty: difficulty !== "all" ? difficulty : undefined,
    sort: sortBy as 'newest' | 'oldest' | 'name',
    limit: 50,
  });

  const spots = data?.spots || [];

  const handleRequestPublic = async (spotId: string) => {
    try {
      await SpotService.requestPublic(spotId);
      toast.success("Spot submitted for public approval!");
      // Refetch to update the spot status
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit for approval");
    }
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Longboarding Spots</h1>

            {/* <div className="flex items-center space-x-2">
              <Link href="/map">
                <Button variant="outline" size="sm">
                  <MapIcon className="h-4 w-4 mr-2" />
                  Map View
                </Button>
              </Link>
            </div> */}
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search spots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* <div className="flex flex-wrap gap-2">
              <Select value={spotType} onValueChange={setSpotType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="downhill">🏔️ Downhill</SelectItem>
                  <SelectItem value="freeride">🛣️ Freeride</SelectItem>
                  <SelectItem value="freestyle">🛴 Freestyle</SelectItem>
                  <SelectItem value="cruising">🏞️ Cruising</SelectItem>
                  <SelectItem value="dancing">💃 Dancing</SelectItem>
                  <SelectItem value="pumping">⚡ Pumping</SelectItem>
                </SelectContent>
              </Select>



              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading spots...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                {spots.length} spot{spots.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {spots.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {spots.map((spot) => (
                  <SpotCard
                    key={spot.id}
                    spot={spot}
                    onViewDetails={() => {
                      router.push(`/spots/${spot.id}`);
                    }}
                    onEditSpot={user?.id === spot.user.id ? () => {
                      router.push(`/spots/${spot.id}/edit`);
                    } : undefined}
                    onRequestPublic={user?.id === spot.user.id ? () => {
                      handleRequestPublic(spot.id);
                    } : undefined}
                    isOwner={user?.id === spot.user.id}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold mb-4">No spots found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || spotType !== "all" || difficulty !== "all"
                    ? "Try adjusting your filters or search terms."
                    : "Be the first to add a longboarding spot!"}
                </p>
                <Link href="/spots/create">
                  <Button>Create First Spot</Button>
                </Link>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}