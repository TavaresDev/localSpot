import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CreateSpotForm from "./_components/create-spot-form";

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
            Test Spots API
          </h1>
          <p className="text-muted-foreground">
            Create a new longboarding spot to test the API endpoints and database integration.
          </p>
        </div>
        
        <CreateSpotForm />
      </div>
    </section>
  );
}