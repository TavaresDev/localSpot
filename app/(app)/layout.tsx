import { MobileNav, CreateSpotFAB } from "@/components/navigation/mobile-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-16 lg:pb-0">
        {children}
      </main>
      <MobileNav />
      <CreateSpotFAB />
    </div>
  );
}