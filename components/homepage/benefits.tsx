import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, Shield, Route, Star, Zap } from "lucide-react";

export default function Benefits() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50/50 to-green-50/50 dark:from-blue-950/20 dark:to-green-950/20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-semibold md:text-4xl">
            Why Choose SpotMap?
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            Join thousands of riders who trust SpotMap for discovering, sharing, and exploring longboarding spots safely.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <BenefitCard
            icon={<MapPin className="size-8 text-blue-600" />}
            title="GPS-Powered Discovery"
            description="Find longboarding spots near you with precise GPS coordinates, detailed directions, and real-time location sharing."
          />
          
          <BenefitCard
            icon={<Users className="size-8 text-green-600" />}
            title="Community-Driven Content"
            description="Access spots shared by local riders, complete with photos, safety notes, and insider tips from the community."
          />
          
          <BenefitCard
            icon={<Shield className="size-8 text-orange-600" />}
            title="Safety First"
            description="Get essential safety information, difficulty ratings, traffic conditions, and hazard warnings for every spot."
          />
          
          <BenefitCard
            icon={<Route className="size-8 text-purple-600" />}
            title="Route Mapping"
            description="Discover optimal routes, elevation profiles, and turn-by-turn navigation for the perfect longboarding experience."
          />
          
          <BenefitCard
            icon={<Star className="size-8 text-yellow-600" />}
            title="Curated Collections"
            description="Save your favorite spots, create custom lists, and discover curated collections from local riding communities."
          />
          
          <BenefitCard
            icon={<Zap className="size-8 text-red-600" />}
            title="Live Events"
            description="Join group rides, competitions, and community events happening at spots near you."
          />
        </div>
      </div>
    </section>
  );
}

const BenefitCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <Card className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/70 dark:bg-card/70 backdrop-blur-sm">
      <CardContent className="space-y-4 p-0">
        <div className="flex justify-center p-3 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 w-fit mx-auto">{icon}</div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};