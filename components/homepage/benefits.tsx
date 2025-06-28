import { Card, CardContent } from "@/components/ui/card";
import { Zap, Shield, TrendingUp } from "lucide-react";

export default function Benefits() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-semibold md:text-4xl">
            Built for modern businesses
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            Everything you need to grow and scale your business efficiently.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <BenefitCard
            icon={<Zap className="size-8 text-blue-600" />}
            title="Fast & Reliable"
            description="Built on modern infrastructure with 99.9% uptime guarantee and lightning-fast performance."
          />
          
          <BenefitCard
            icon={<Shield className="size-8 text-green-600" />}
            title="Secure by Default"
            description="Enterprise-grade security with authentication, encryption, and compliance built-in from day one."
          />
          
          <BenefitCard
            icon={<TrendingUp className="size-8 text-purple-600" />}
            title="Scales with You"
            description="From startup to enterprise, our platform grows with your business needs automatically."
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
    <Card className="p-6 text-center hover:shadow-lg transition-shadow">
      <CardContent className="space-y-4 p-0">
        <div className="flex justify-center">{icon}</div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};