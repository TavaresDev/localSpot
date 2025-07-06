"use client";

import { useState, useEffect } from "react";
import { EventCard } from "@/components/events/event-card";
import { EventWithSpot } from "@/lib/types/spots";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Plus, Calendar, Clock } from "lucide-react";
import Link from "next/link";

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithSpot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("startTime");
  const [timeFilter, setTimeFilter] = useState<string>("upcoming");

  // Fetch events
  useEffect(() => {
    async function fetchEvents() {
      try {
        setIsLoading(true);
        
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        params.append("sort", sortBy);
        params.append("limit", "50");
        
        // Apply time-based filters
        const now = new Date();
        
        switch (timeFilter) {
          case "upcoming":
            params.append("upcoming", "true");
            break;
          case "today":
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
            params.append("startDate", todayStart.toISOString());
            params.append("endDate", todayEnd.toISOString());
            break;
          case "this_week":
            const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
            params.append("startDate", weekStart.toISOString());
            params.append("endDate", weekEnd.toISOString());
            break;
          case "past":
            params.append("endDate", now.toISOString());
            break;
        }
        
        const response = await fetch(`/api/events?${params}`);
        if (!response.ok) throw new Error("Failed to fetch events");
        
        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [searchQuery, sortBy, timeFilter]);

  const handleViewDetails = (event: EventWithSpot) => {
    window.location.href = `/events/${event.id}`;
  };

  // RSVP functionality removed as requested

  // Group events by time categories for better UX
  const groupedEvents = {
    today: events.filter(event => {
      const eventDate = new Date(event.startTime);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    }),
    upcoming: events.filter(event => {
      const eventDate = new Date(event.startTime);
      const today = new Date();
      return eventDate > today && eventDate.toDateString() !== today.toDateString();
    }),
    past: events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate < new Date();
    })
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Longboarding Events</h1>
            
            <Link href="/events/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Time Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">🔮 Upcoming</SelectItem>
                  <SelectItem value="today">📅 Today</SelectItem>
                  <SelectItem value="this_week">📆 This Week</SelectItem>
                  <SelectItem value="past">📰 Past Events</SelectItem>
                  <SelectItem value="all">📊 All Events</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startTime">⏰ Event Time</SelectItem>
                  <SelectItem value="newest">🆕 Newest First</SelectItem>
                  <SelectItem value="oldest">📜 Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading events...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                {events.length} event{events.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {events.length > 0 ? (
              timeFilter === "all" ? (
                // Show grouped view for all events
                <Tabs defaultValue="upcoming" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upcoming" className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Upcoming ({groupedEvents.upcoming.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="today" className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Today ({groupedEvents.today.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="past" className="flex items-center space-x-2">
                      <span>Past ({groupedEvents.past.length})</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {groupedEvents.upcoming.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onViewDetails={() => handleViewDetails(event)}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="today" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {groupedEvents.today.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onViewDetails={() => handleViewDetails(event)}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="past" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {groupedEvents.past.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onViewDetails={() => handleViewDetails(event)}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                // Show filtered list view
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onViewDetails={() => handleViewDetails(event)}
                    />
                  ))}
                </div>
              )
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-4">No events found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || timeFilter !== "upcoming"
                    ? "Try adjusting your filters or search terms."
                    : "Be the first to organize a longboarding event!"}
                </p>
                <Link href="/events/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Event
                  </Button>
                </Link>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}