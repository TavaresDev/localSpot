"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Camera, Globe, Lock } from "lucide-react";
import Link from "next/link";

export default function TutorialSection() {
  return (
    <section className="py-12 px-4 bg-gradient-to-br from-blue-50/30 to-green-50/30 dark:from-blue-950/10 dark:to-green-950/10">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">How It Works</h2>
          <p className="text-muted-foreground">
            Create and discover longboarding spots in 3 simple steps
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1 */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    Double-tap to Pin
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Open the map and double-tap anywhere to drop a pin at your favorite longboarding spot. 
                    It's that simple!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-green-500" />
                    Add Details
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Add photos, safety notes, difficulty level, and what makes this spot special. 
                    Help fellow riders know what to expect.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-500" />
                    Share or Save
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Make it public to help the community discover new spots, or keep it private 
                    for your personal collection.
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      <span>Public</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Lock className="w-4 h-4" />
                      <span>Private</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button asChild variant="outline" size="lg" className="w-full max-w-xs">
            <Link href="/map" prefetch={true}>
              Try It Now
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}