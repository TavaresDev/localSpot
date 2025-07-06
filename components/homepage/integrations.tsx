import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, Zap, Trophy, Users2, BarChart3, Share2 } from "lucide-react";
import * as React from "react";

export default function Features() {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Coming Soon: Strava for Longboarding
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Track your runs, record speeds, compare times, and share your achievements with the longboarding community.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Track Your Runs"
            description="Record your downhill runs with GPS precision. Track distance, time, and route automatically."
            icon="⏱️"
            isComingSoon
          />

          <FeatureCard
            title="Speed Recording"
            description="Monitor max speed, average speed, and acceleration. See your speed over time and distance."
            icon="⚡"
            isComingSoon
          />

          <FeatureCard
            title="Path Mapping"
            description="Visualize your exact route with elevation profiles and turn analysis. Perfect your lines."
            icon="🗺️"
            isComingSoon
          />

          <FeatureCard
            title="Personal Records"
            description="Track your best times on each run. Set goals and beat your personal bests."
            icon="🏆"
            isComingSoon
          />

          <FeatureCard
            title="Share Results"
            description="Share your runs on social media with interactive maps, stats, and photos."
            icon="📱"
            isComingSoon
          />
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              🚀 Join the beta waitlist for early access
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

const FeatureCard = ({
  title,
  description,
  icon,
  isComingSoon,
}: {
  title: string;
  description: string;
  icon: string;
  isComingSoon?: boolean;
}) => {
  return (
    <Card className="p-6 h-full transition-all duration-300 border-0 bg-white/80 dark:bg-card/80 backdrop-blur-sm relative overflow-hidden group">
      {isComingSoon && (
        <Badge
          variant="secondary"
          className="absolute top-3 right-3 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0"
        >
          Coming Soon
        </Badge>
      )}

      <div className="space-y-4">
        <div className="text-4xl">{icon}</div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
      </div>

      {isComingSoon && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
      )}
    </Card>
  );
};
