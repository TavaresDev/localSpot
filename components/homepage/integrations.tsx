import { Card } from "@/components/ui/card";
import { Smartphone, MapIcon, Camera, TrendingUp, AlertTriangle, Navigation } from "lucide-react";
import * as React from "react";

export default function Features() {
  return (
    <section className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900">
      <div className="pt-16 pb-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-balance text-3xl font-semibold md:text-4xl">
              Powerful Features for Every Rider
            </h2>
            <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
              From GPS navigation to community events, SpotMap gives you all the tools you need for epic longboarding adventures.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Mobile-First Experience"
              description="Native mobile interface optimized for on-the-go spot discovery and navigation."
            >
              <Smartphone className="size-10 text-blue-600" />
            </FeatureCard>

            <FeatureCard
              title="Offline Maps"
              description="Download spot information for offline access when you're in remote locations."
            >
              <MapIcon className="size-10 text-green-600" />
            </FeatureCard>

            <FeatureCard
              title="Photo Sharing"
              description="Share spot photos and action shots with the community to inspire other riders."
            >
              <Camera className="size-10 text-purple-600" />
            </FeatureCard>

            <FeatureCard
              title="Difficulty Ratings"
              description="Clear skill level indicators from beginner-friendly to expert-only spots."
            >
              <TrendingUp className="size-10 text-orange-600" />
            </FeatureCard>

            <FeatureCard
              title="Safety Alerts"
              description="Real-time hazard warnings, traffic updates, and weather conditions."
            >
              <AlertTriangle className="size-10 text-red-600" />
            </FeatureCard>

            <FeatureCard
              title="Route Planning"
              description="Plan multi-spot sessions with optimized routes and elevation profiles."
            >
              <Navigation className="size-10 text-yellow-600" />
            </FeatureCard>
          </div>
        </div>
      </div>
    </section>
  );
}

const FeatureCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => {
  return (
    <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white dark:bg-card group">
      <div className="relative">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
            {children}
          </div>
        </div>

        <div className="space-y-3 text-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  );
};
