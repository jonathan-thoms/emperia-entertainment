"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "customer";
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (requiredRole === "admin" && profile?.role !== "admin") {
      router.replace("/");
    }
  }, [user, profile, loading, requiredRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <span className="text-sm text-on-surface-variant tracking-wider">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (requiredRole === "admin" && profile?.role !== "admin") return null;

  return <>{children}</>;
}
