"use client";

import { Button } from "@/components/ui/button";
import { SignInButton } from "@/components/auth/sign-in-button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/hooks/useAuth";
import { MapPin, Waves, Mountain, Users } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-blue-950/20 dark:via-background dark:to-green-950/20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      
      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-8">
          {/* Product badge */}
          <Badge variant="secondary" className="mb-6 bg-gradient-to-r from-blue-100 to-green-100 text-blue-700 border-blue-200 dark:from-blue-900/50 dark:to-green-900/50 dark:text-blue-300 dark:border-blue-700">
            <MapPin className="w-3 h-3 mr-1" />
            The longboarding community platform
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-green-800 bg-clip-text text-transparent dark:from-white dark:via-blue-200 dark:to-green-200">
            {isAuthenticated && user 
              ? `Welcome back, ${user.name.split(' ')[0]}!` 
              : 'Find Your Perfect Ride'
            }
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isAuthenticated 
              ? "Ready to discover new spots and share your adventures with the community?"
              : "Discover pump tracks, downhill routes, and hidden gems shared by riders worldwide. Join the community and make every ride epic."
            }
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button asChild size="lg" className="h-12 px-8 text-lg font-medium bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <Link href="/map" prefetch={true}>
              <MapPin className="w-5 h-5 mr-2" />
              Start Exploring
            </Link>
          </Button>
          
          {!isAuthenticated && (
            <SignInButton 
              variant="outline" 
              size="lg" 
              className="h-12 px-8 text-lg border-2 hover:bg-blue-50 dark:hover:bg-blue-950/50"
              returnTo="/map"
            >
              Sign In to Save Spots
            </SignInButton>
          )}
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          <FeatureHighlight 
            icon={<Waves className="w-5 h-5" />}
            label="100+ Pump Tracks"
            gradient="from-blue-500 to-cyan-500"
          />
          <FeatureHighlight 
            icon={<Mountain className="w-5 h-5" />}
            label="20+ Hills Mapped"
            gradient="from-green-500 to-emerald-500"
          />
          <FeatureHighlight 
            icon={<MapPin className="w-5 h-5" />}
            label="Moderated & Private"
            gradient="from-orange-500 to-red-500"
          />
          <FeatureHighlight 
            icon={<Users className="w-5 h-5" />}
            label="2K+ Riders"
            gradient="from-purple-500 to-pink-500"
          />
        </div>
      </div>
    </section>
  );
}

const FeatureHighlight = ({ 
  icon, 
  label, 
  gradient 
}: { 
  icon: React.ReactNode; 
  label: string; 
  gradient: string; 
}) => (
  <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/60 dark:bg-card/60 backdrop-blur-sm border border-white/20 dark:border-gray-800/50 hover:bg-white/80 dark:hover:bg-card/80 transition-all duration-300">
    <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} text-white shadow-lg`}>
      {icon}
    </div>
    <span className="text-sm font-medium text-center">{label}</span>
  </div>
);
