import FooterSection from "@/components/homepage/footer";
import HeroSection from "@/components/homepage/hero-section";
import Benefits from "@/components/homepage/benefits";
import TutorialSection from "@/components/homepage/tutorial-section";
import Features from "@/components/homepage/integrations";
import { SimplePlacesSearchV2 } from "@/components/simple-places-search-v2";

export default async function Home() {
  return (
    <>
      <HeroSection />
      <TutorialSection />
      <div className="container mx-auto py-8">
        <h2 className="text-2xl font-bold text-center mb-8">Test Google Places Search</h2>
        <SimplePlacesSearchV2 mode='manual' />  
      </div>
      {/* <Features /> */}
      {/* <PricingTable subscriptionDetails={subscriptionDetails} /> */}

      {/* <Benefits /> */}
     
      <FooterSection />
    </>
  );
}
