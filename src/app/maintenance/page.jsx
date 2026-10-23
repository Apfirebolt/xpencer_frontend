"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Cookie from "js-cookie";
import { useTranslation } from "@/context/LanguageContext";
import { 
  WrenchScrewdriverIcon, 
  ClockIcon, 
  UserCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export default function MaintenancePage() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userCookie = Cookie.get("user");
    if (userCookie) {
      try {
        setUser(JSON.parse(userCookie));
      } catch (err) {
        console.error("Failed to parse user cookie:", err);
      }
    }
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light flex flex-col font-sans selection:bg-primary selection:text-white">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-20 flex flex-col items-center justify-center text-center space-y-12">
        
        {/* User Status Banner */}
        {user && (
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 shadow-sm">
            <UserCircleIcon className="h-4 w-4" />
            <span>{t('maintenance.authenticatedAs') || 'Authenticated as'}: <strong className="text-dark dark:text-light">{user.username || user.email}</strong></span>
          </div>
        )}

        {/* HERO MAINTENANCE CARD */}
        <div 
          className="w-full p-10 sm:p-16 rounded-3xl bg-white/60 dark:bg-dark/60 backdrop-blur-xl border border-tertiary/20 dark:border-tertiary/10 space-y-8 shadow-xl relative overflow-hidden"
        >
          {/* Subtle background glow accent */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />

          {/* Icon Badge */}
          <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner animate-pulse">
            <WrenchScrewdriverIcon className="h-10 w-10 text-primary" />
          </div>

          <div className="space-y-4 max-w-lg mx-auto">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heading leading-tight">
              {t('maintenance.title1') || 'We Are Upgrading'} <span className="text-primary">{t('maintenance.title2') || 'Xpencer'}</span>
            </h1>
            
            <p className="text-dark/70 dark:text-light/70 text-base sm:text-lg leading-relaxed font-sans">
              {t('maintenance.subtitle') || 'Our servers are currently undergoing scheduled maintenance to bring you an improved experience.'}
            </p>
          </div>

          {/* Status Details / ETA Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-tertiary/10 border border-tertiary/20 text-xs text-dark/70 dark:text-light/70 font-mono">
            <ClockIcon className="h-4 w-4 text-primary" />
            <span>{t('maintenance.downtime') || 'Expected downtime: Minimal. Check back shortly.'}</span>
          </div>

          {/* Action Button */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleRefresh}
              className="px-6 py-3.5 rounded-2xl font-bold bg-primary hover:bg-secondary text-white transition-all flex items-center gap-2 shadow-lg shadow-primary/25 group cursor-pointer"
            >
              <ArrowPathIcon className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              <span>{t('maintenance.refreshBtn') || 'Check Status / Refresh'}</span>
            </button>
          </div>
        </div>

        {/* TECH STACK / BRAND FOOTNOTE */}
        <div className="text-xs text-dark/50 dark:text-light/50 font-mono">
          {t('maintenance.footerText') || 'Xpencer Financial Ecosystem • Secure Maintenance Mode'}
        </div>

      </main>

      <Footer />
    </div>
  );
}