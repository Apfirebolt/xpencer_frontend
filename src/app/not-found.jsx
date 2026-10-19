'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HomeIcon, ChartPieIcon, WalletIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light flex flex-col font-sans selection:bg-primary selection:text-white transition-colors duration-200">
      <Header />

      <main className="flex-grow flex items-center justify-center px-6 py-24">
        <div className="max-w-xl w-full text-center space-y-8 relative">
          
          {/* Subtle background glow effect using theme primary token */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

          {/* Icon Badge */}
          <div className="relative z-10 w-20 h-20 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
            <ExclamationTriangleIcon className="h-10 w-10" />
          </div>

          {/* Heading & Error Code */}
          <div className="relative z-10 space-y-3">
            <span className="text-xs font-mono tracking-widest uppercase text-primary font-semibold">
              Error 404
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-heading">
              Page Ledger Not Found
            </h1>
            <p className="text-sm sm:text-base text-dark/70 dark:text-light/70 max-w-md mx-auto leading-relaxed font-sans">
              Oops! The expense log, budget planner, or page you are looking for has been removed, relocated, or doesn't exist.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold bg-primary hover:bg-secondary text-white transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
            >
              <HomeIcon className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>

            <Link
              href="/budgets"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold bg-white dark:bg-tertiary/5 border border-tertiary/30 hover:border-primary text-dark dark:text-light transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <ChartPieIcon className="h-4 w-4 text-primary" />
              <span>View Budgets</span>
            </Link>

            <Link
              href="/expenses"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold bg-white dark:bg-tertiary/5 border border-tertiary/30 hover:border-primary text-dark dark:text-light transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <WalletIcon className="h-4 w-4 text-primary" />
              <span>Manage Expenses</span>
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;