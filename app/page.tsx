import FooterSection from "@/components/homepage/footer";
import HeroSection from "@/components/homepage/hero-section";
import Benefits from "@/components/homepage/benefits";
import Features from "@/components/homepage/integrations";
// import { getSubscriptionDetails } from "@/lib/subscription";
// import PricingTable from "./pricing/_component/pricing-table";
import { SimplePlacesSearch } from "@/components/simple-places-search";

export default async function Home() {
  // const subscriptionDetails = await getSubscriptionDetails();

  return (
    <>
      <HeroSection />
      <Benefits />
      <div className="container mx-auto py-8">
        <h2 className="text-2xl font-bold text-center mb-8">Test Google Places Search</h2>
        <SimplePlacesSearch />
      </div>
      <Features />
      {/* <PricingTable subscriptionDetails={subscriptionDetails} /> */}
      <FooterSection />
    </>
  );
}
