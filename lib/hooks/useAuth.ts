"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (returnTo?: string) => Promise<void>;
  signOut: (redirectTo?: string) => Promise<void>;
  refreshSession: () => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const { data: session, isPending: isLoading } = authClient.useSession();

  const user = session?.user || null;
  const isAuthenticated = !!user;

  const signIn = useCallback(async (returnTo?: string) => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: returnTo || "/dashboard",
    });
  }, []);

  const signOut = useCallback(async (redirectTo?: string) => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(redirectTo || "/");
        },
      },
    });
  }, [router]);

  const refreshSession = useCallback(() => {
    // Force a session refresh by calling the auth client
    window.location.reload();
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    refreshSession,
  };
}