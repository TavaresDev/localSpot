import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="relative z-10 mx-auto w-full max-w-2xl px-6 lg:px-0">
        <div className="relative text-center">
          <p className="text-3xl">🛹</p>
          <h1 className="mx-auto mt-12 max-w-xl text-balance text-5xl font-medium">
            Discover Longboarding Spots
          </h1>
          <p className="text-muted-foreground mx-auto mb-6 mt-4 text-balance text-xl">
            Find your perfect ride with community-driven spot discovery, safety notes, and route mapping. Join thousands of riders exploring the world&apos;s best longboarding locations.
          </p>
          <div className="flex flex-col items-center gap-4 *:w-full sm:flex-row sm:justify-center sm:*:w-auto">
            <Button asChild variant="default" size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href="/spots" prefetch={true}>
                <span className="text-nowrap font-semibold">🗺️ Explore Spots</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 hover:bg-primary/5 transition-all duration-300">
              <Link href="/dashboard" prefetch={true}>
                <span className="text-nowrap font-semibold">Dashboard</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 shadow-2xl">
          <Image
            src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Longboarding downhill action"
            className="absolute inset-0 size-full object-cover"
            width={1920}
            height={1080}
          />

          {/* <div className="bg-background rounded-(--radius) relative m-4 overflow-hidden border border-transparent shadow-xl shadow-black/15 ring-1 ring-black/10 sm:m-8 md:m-12">
            <Image
              src="https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="SpotMap mobile app interface showing longboarding spots"
              width="2880"
              height="1842"
              className="object-top-left size-full object-cover"
            />
          </div> */}
        </div>
      </div>
    </section>
  );
}
