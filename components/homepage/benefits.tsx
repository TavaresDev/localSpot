import { Card, CardContent } from "@/components/ui/card";
import { Mountain, Shield, Lock, Waves } from "lucide-react";

export default function Benefits() {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-blue-50/20 to-green-50/20 dark:from-blue-950/5 dark:to-green-950/5">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Discover. Share. Ride.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to find and share the best longboarding spots
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <BenefitCard
            icon={<Waves className="w-8 h-8" />}
            title="Pump Tracks"
            description="1,200+ pump tracks mapped by riders. Concrete bowls, wooden berms, and flow trails."
            accent="from-blue-500 to-cyan-500"
            bgAccent="from-blue-500/10 to-cyan-500/10"
          />
          
          <BenefitCard
            icon={<Mountain className="w-8 h-8" />}
            title="Local Hills"
            description="Downhill spots, scenic routes, and hidden gems shared by local communities."
            accent="from-green-500 to-emerald-500"
            bgAccent="from-green-500/10 to-emerald-500/10"
          />
          
          <BenefitCard
            icon={<Shield className="w-8 h-8" />}
            title="Safety First"
            description="Verified safety notes, difficulty ratings, and hazard warnings from the community."
            accent="from-orange-500 to-red-500"
            bgAccent="from-orange-500/10 to-red-500/10"
          />
          
          <BenefitCard
            icon={<Lock className="w-8 h-8" />}
            title="Your Choice"
            description="Keep spots private for yourself or share with the community. Complete control."
            accent="from-purple-500 to-pink-500"
            bgAccent="from-purple-500/10 to-pink-500/10"
          />
        </div>

        <div className="mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800/50">
            <div className="flex items-center justify-center gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-600">100+</div>
                <div className="text-sm text-muted-foreground">Pump Tracks</div>
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent"></div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-600">20+</div>
                <div className="text-sm text-muted-foreground">Hills Mapped</div>
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent"></div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-orange-600">2K+</div>
                <div className="text-sm text-muted-foreground">Active Riders</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const BenefitCard = ({
  icon,
  title,
  description,
  accent,
  bgAccent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
  bgAccent: string;
}) => {
  return (
    <Card className="group relative overflow-hidden border-0 bg-white/70 dark:bg-card/70 backdrop-blur-sm hover:shadow-xl transition-all duration-500 hover:scale-105">
      <div className={`absolute inset-0 bg-gradient-to-br ${bgAccent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <CardContent className="relative px-6 py-4 space-y-4">
        <div className="flex items-center  gap-6 mb-8">
          <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${accent} shadow-lg`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        </div>
        
        <p className="text-muted-foreground text-md leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};