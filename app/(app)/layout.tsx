import { MobileNav, CreateSpotFAB } from "@/components/navigation/mobile-nav";
import { LocationHomingFAB } from "@/components/navigation/location-homing-fab";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="">
        {children}
      </main>
      <MobileNav />
      {/* <CreateSpotFAB /> */}
      <LocationHomingFAB />
    </div>
  );
}