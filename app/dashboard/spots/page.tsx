import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DesktopSpotForm } from "@/components/desktop/desktop-spot-form";
import SpotFormErrorBoundary from "@/components/error-boundaries/spot-form-error-boundary";

export default async function SpotsPage() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session?.userId) {
    redirect("/sign-in");
  }

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col items-start justify-center gap-2 mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            Manage Spots
          </h1>
          <p className="text-muted-foreground">
            Create and manage longboarding spots in the community database.
          </p>
        </div>
        
        <SpotFormErrorBoundary>
          <DesktopSpotForm />
        </SpotFormErrorBoundary>
      </div>
    </section>
  );
}