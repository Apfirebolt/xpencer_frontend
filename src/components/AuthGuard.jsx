"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { WalletIcon } from "@heroicons/react/24/outline";

export default function AuthGuard({ children }) {
  const { user, isAuthenticated, initializeAuth } = useAuthStore();
  const router = useRouter();

  // Initialize session from cookies on mount
  useEffect(() => {
    if (!isAuthenticated || !user) {
      initializeAuth();
    }
  }, [isAuthenticated, user, initializeAuth]);

  // Handle redirection if unauthenticated after initialization attempt
  useEffect(() => {
    const timer = setTimeout(() => {
      // Re-verify auth state from store/cookies after a brief micro-tick
      const hasToken = document.cookie.includes("token=");
      if (!user && !hasToken) {
        router.replace("/login");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, router]);

  // Show a professional loading skeleton while session is being verified
  if (!user) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse text-primary shadow-lg">
          <WalletIcon className="h-8 w-8 animate-bounce" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-sm font-bold font-heading text-dark dark:text-light">Verifying Security Session...</p>
          <p className="text-xs text-dark/50 dark:text-light/50 font-sans">Securing your financial ledger</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}