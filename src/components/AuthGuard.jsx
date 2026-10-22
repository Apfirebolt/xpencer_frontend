"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { WalletIcon } from "@heroicons/react/24/outline";

export default function AuthGuard({ children }) {
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 1. Synchronously initialize auth from cookies (or logout/reset if corrupted/missing)
    initializeAuth();

    // 2. Read latest auth state directly from the store
    const authed = useAuthStore.getState().isAuthenticated;

    if (!authed) {
      router.replace("/login");
    } else {
      setIsChecking(false);
    }
  }, [initializeAuth, router]);

  // If still checking or not authenticated, render loading screen until redirected
  if (isChecking || !isAuthenticated) {
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