'use client';

import { WalletIcon } from '@heroicons/react/24/outline';

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full bg-light dark:bg-dark transition-colors space-y-4">
      <div className="relative flex items-center justify-center">
        {/* Pulsing outer glow ring */}
        <div className="absolute w-20 h-20 bg-primary/10 rounded-full animate-ping pointer-events-none" />
        
        {/* Spinner ring using theme colors */}
        <div
          role="status"
          aria-label="Loading"
          className="w-16 h-16 border-4 border-tertiary/20 dark:border-tertiary/10 border-t-primary rounded-full animate-spin"
        />

        {/* Center icon branding */}
        <div className="absolute inset-0 flex items-center justify-center text-primary">
          <WalletIcon className="h-6 w-6 animate-pulse" />
        </div>
      </div>
      
      <p className="text-xs font-bold uppercase tracking-wider text-dark/50 dark:text-light/50 font-heading animate-pulse">
        Loading Ledger...
      </p>
    </div>
  );
};

export default Loader;