import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Home, Plus, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
        {/* Main Error Message */}
        <div className="mb-8">
          <div className="text-8xl mb-4">🛹</div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Spot Not Found
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            This longboarding spot doesn't exist in our map yet.
          </p>
          <p className="text-muted-foreground">
            The page you're looking for might have been moved, deleted, or never existed.
          </p>
        </div>

        {/* Error Code */}
        <div className="mb-8">
          <span className="inline-block px-4 py-2 bg-muted/50 rounded-full text-sm font-mono text-muted-foreground">
            404 - Page Not Found
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Button asChild size="lg" className="gap-2">
            <Link href="/map">
              <MapPin className="size-4" />
              Explore Map
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/spots">
              <Search className="size-4" />
              Browse Spots
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/spots/create">
              <Plus className="size-4" />
              Add New Spot
            </Link>
          </Button>
          
          <Button asChild variant="ghost" size="lg" className="gap-2">
            <Link href="/">
              <Home className="size-4" />
              Back Home
            </Link>
          </Button>
        </div>

        {/* Helpful Suggestions */}
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Looking for something specific?</p>
          <ul className="space-y-1">
            <li>• Check out our <Link href="/map" className="text-primary hover:underline">interactive map</Link> to discover spots near you</li>
            <li>• Browse our <Link href="/spots" className="text-primary hover:underline">complete spot directory</Link></li>
            <li>• Help grow the community by <Link href="/spots/create" className="text-primary hover:underline">adding a new spot</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}