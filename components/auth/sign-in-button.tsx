"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SignInButtonProps {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  returnTo?: string;
  children?: React.ReactNode;
}

export function SignInButton({ 
  variant = "default", 
  size = "default", 
  className = "",
  returnTo,
  children 
}: SignInButtonProps) {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signIn(returnTo);
    } catch (error) {
      console.error("Sign-in failed:", error);
      toast.error("Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignIn}
      disabled={loading}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children || (loading ? "Signing in..." : "Sign In")}
    </Button>
  );
}