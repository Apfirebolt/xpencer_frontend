"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Cookie from "js-cookie";
import { 
  WalletIcon, 
  ChartPieIcon, 
  UserGroupIcon, 
  ShieldCheckIcon, 
  RectangleStackIcon,
  CodeBracketIcon,
  ArrowRightIcon,
  BoltIcon,
  UserCircleIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";

const AboutPage = () => {
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

  const features = [
    {
      icon: <ChartPieIcon className="h-6 w-6 text-primary" />,
      title: "Intelligent Budget Planner",
      description: "Set monthly category limits, receive real-time spending pace warnings, and visualize your financial allocations effortlessly."
    },
    {
      icon: <RectangleStackIcon className="h-6 w-6 text-primary" />,
      title: "Automated Expense Tracking",
      description: "Log daily transactions, organize items with custom tags, and instantly audit where every dollar goes with granular filters."
    },
    {
      icon: <UserGroupIcon className="h-6 w-6 text-primary" />,
      title: "Seamless Bill Splitting",
      description: "Split dinners, group trips, and shared household bills with friends using flexible percentage, exact amount, or equal splits."
    },
    {
      icon: <CurrencyDollarIcon className="h-6 w-6 text-primary" />,
      title: "Multi-Currency Support",
      description: "Manage expenses across global currencies with live conversion rates, making international travel and remote collaboration smooth."
    },
    {
      icon: <ShieldCheckIcon className="h-6 w-6 text-primary" />,
      title: "Secure Encrypted Ledger",
      description: "Your financial data is protected with rigorous encryption standards, secure HTTP-only session cookies, and strict data isolation."
    },
    {
      icon: <WalletIcon className="h-6 w-6 text-primary" />,
      title: "Real-Time Net Worth Insights",
      description: "Monitor your financial health indicators, outstanding balances with peers, and historical spending trends on demand."
    }
  ];

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light flex flex-col font-sans selection:bg-primary selection:text-white">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-20 space-y-28">
        
        {/* HERO SECTION with AOS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6" data-aos="fade-right">
            
            {/* User Login Status Banner */}
            {user ? (
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 shadow-sm">
                <UserCircleIcon className="h-4 w-4" />
                <span>Active Financial Session: <strong className="text-dark dark:text-light">{user.username || user.email}</strong></span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase border border-primary/20 shadow-sm">
                <CodeBracketIcon className="h-4 w-4 animate-pulse" />
                <span>Smart Expense Suite</span>
              </div>
            )}
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-heading leading-tight">
              Master Your Money <span className="text-primary">Without Friction.</span>
            </h1>
            
            <p className="text-dark/70 dark:text-light/70 text-base sm:text-lg leading-relaxed font-sans max-w-2xl">
              Xpencer brings clarity to personal and shared finances. Keep budgets on track, categorize daily purchases, 
              and split group expenses effortlessly all in one beautifully engineered dashboard.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="/dashboard"
                className="px-6 py-3.5 rounded-2xl font-bold bg-primary hover:bg-secondary text-white transition-all flex items-center gap-2 shadow-lg shadow-primary/25 group"
              >
                <span>Open Dashboard</span>
                <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/budgets"
                className="px-6 py-3.5 rounded-2xl font-bold bg-tertiary/20 hover:bg-tertiary/30 text-dark dark:text-light transition-all border border-tertiary/30"
              >
                Explore Budgets
              </a>
            </div>
          </div>

          {/* Visual Card with AOS */}
          <div className="lg:col-span-5" data-aos="fade-left" data-aos-delay="200">
            <div className="relative p-8 rounded-3xl bg-gradient-to-tr from-primary/15 via-tertiary/10 to-transparent border border-primary/20 dark:border-primary/10 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-danger animate-pulse" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                </div>
                <span className="text-xs font-mono text-dark/50 dark:text-light/50">xpencer-ledger.secure</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-dark/5 dark:bg-white/5 border border-tertiary/20 flex items-center justify-between">
                  <span className="text-primary font-bold">BUDGET_ENGINE</span>
                  <span className="text-success">Active & Monitoring</span>
                </div>
                <div className="p-3 rounded-xl bg-dark/5 dark:bg-white/5 border border-tertiary/20 flex items-center justify-between">
                  <span className="text-primary font-bold">EXPENSE_SPLITS</span>
                  <span className="text-light">Peer-to-Peer Sync</span>
                </div>
                <div className="p-3 rounded-xl bg-dark/5 dark:bg-white/5 border border-tertiary/20 flex items-center justify-between">
                  <span className="text-primary font-bold">SECURITY</span>
                  <span className="text-warning">End-to-End Encrypted</span>
                </div>
                {user && (
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                    <span className="text-primary font-bold">USER_SESSION</span>
                    <span className="text-primary truncate max-w-[160px]">{user.email}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center gap-3 text-xs text-dark/60 dark:text-light/60">
                <BoltIcon className="h-4 w-4 text-primary" />
                <span>Zero third-party tracking. Private financial ledger.</span>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURE GRID with AOS */}
        <div className="space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto" data-aos="fade-up">
            <h2 className="text-3xl font-bold tracking-tight font-heading">Engineered for Smart Financial Control</h2>
            <p className="text-xs text-dark/60 dark:text-light/60 font-sans">
              Explore the core capabilities powering the Xpencer ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, index) => (
              <div 
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="p-8 rounded-3xl bg-white/60 dark:bg-dark/60 backdrop-blur-xl border border-tertiary/20 dark:border-tertiary/10 space-y-4 hover:border-primary/50 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="font-bold text-lg font-heading">{feat.title}</h3>
                <p className="text-xs text-dark/70 dark:text-light/70 leading-relaxed font-sans">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* TECH STACK CALLOUT with AOS */}
        <div 
          data-aos="zoom-in"
          className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-primary/20 via-tertiary/10 to-primary/10 border border-primary/30 shadow-2xl space-y-6 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none" />
          
          <h3 className="text-3xl font-extrabold tracking-tight font-heading">Powered by Modern Web Standards</h3>
          <p className="text-sm text-dark/70 dark:text-light/70 max-w-2xl mx-auto font-sans leading-relaxed">
            Crafted with Next.js App Router, React, Tailwind CSS, Mongoose for robust relational data persistence, 
            and secure cookie-based session management.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4">
            {["Next.js", "React", "MongoDB", "Mongoose", "Tailwind CSS", "Axios"].map((tech, idx) => (
              <span key={idx} className="px-4 py-2 rounded-xl bg-white/80 dark:bg-dark/80 border border-tertiary/30 text-primary font-mono text-xs font-bold shadow-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;