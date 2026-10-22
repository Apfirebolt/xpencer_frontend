'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { currencies } from '@/utils/constants';
import { 
  CalendarIcon, 
  TrashIcon, 
  UserGroupIcon, 
  UserIcon, 
  CheckCircleIcon, 
  ClockIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  WalletIcon
} from '@heroicons/react/24/outline';

// Helper to return the correct icon based on the payment mode string
const getPaymentModeIcon = (mode) => {
  if (!mode) return <WalletIcon className="h-3.5 w-3.5" />;
  const lower = mode.toLowerCase();
  if (lower.includes("card")) return <CreditCardIcon className="h-3.5 w-3.5" />;
  if (lower.includes("upi")) return <DevicePhoneMobileIcon className="h-3.5 w-3.5" />;
  if (lower.includes("cash")) return <BanknotesIcon className="h-3.5 w-3.5" />;
  if (lower.includes("bank") || lower.includes("net")) return <BuildingLibraryIcon className="h-3.5 w-3.5" />;
  return <WalletIcon className="h-3.5 w-3.5" />;
};

export default function ExpenseListView({ expenses, onDelete }) {
  const { user } = useAuthStore();

  // Extract user preferred currency symbol
  const userCurrencyCode = user?.settings?.currency || 'USD';
  const currencyObj = currencies.find((c) => c.code === userCurrencyCode) || { symbol: '$', code: 'USD' };
  const currencySymbol = currencyObj.symbol;

  if (!expenses || expenses.length === 0) return null;

  return (
    <div className="space-y-4 max-w-4xl mx-auto w-full">
      {expenses.map((exp) => {
        const isSplit = exp.isSplit;
        const roomTitle = exp.roomId?.title;
        const payerName = exp.paidBy 
          ? `${exp.paidBy.firstName || ''} ${exp.paidBy.lastName || ''}`.trim() || exp.paidBy.email 
          : null;

        const paymentMode = exp.mode || "Cash";

        return (
          <div 
            key={exp._id || Math.random()} 
            className={`p-6 rounded-[1.5rem] bg-white/90 dark:bg-dark/90 backdrop-blur-md border transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-0.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 group ${
              isSplit 
                ? 'border-primary/40 bg-gradient-to-r from-primary/[0.04] via-transparent to-transparent shadow-primary/5' 
                : 'border-tertiary/20 dark:border-tertiary/15 hover:border-primary/50 shadow-tertiary/10'
            }`}
          >
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-13 h-13 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/25 shrink-0 text-primary font-bold font-heading shadow-xs">
                {currencySymbol}{Number(exp.amount).toFixed(0)}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Category Badge */}
                  <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold font-mono border border-primary/20 shadow-xs">
                    {exp.category}
                  </span>

                  {/* Payment Mode Badge with Icon */}
                  <span className="px-3 py-1 rounded-xl bg-secondary/10 text-secondary text-xs font-bold font-mono border border-secondary/20 shadow-xs flex items-center gap-1.5">
                    {getPaymentModeIcon(paymentMode)}
                    {paymentMode}
                  </span>

                  {/* Split Expense Badge */}
                  {isSplit && (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold font-mono border border-amber-500/20 flex items-center gap-1.5 shadow-xs">
                      <UserGroupIcon className="h-3 w-3" />
                      Split Share
                    </span>
                  )}

                  <span className="text-xs text-dark/40 dark:text-light/40 flex items-center gap-1 font-mono">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : 'Just now'}
                  </span>
                </div>

                <p className="text-sm font-semibold text-dark dark:text-light leading-snug">
                  {exp.description || 'No description provided'}
                </p>

                {/* Split & Room Metadata Details */}
                {isSplit && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1.5 text-xs text-dark/60 dark:text-light/60">
                    {roomTitle && (
                      <span className="inline-flex items-center gap-1.5 text-primary font-medium">
                        <UserGroupIcon className="h-3.5 w-3.5" /> Room: {roomTitle}
                      </span>
                    )}
                    {payerName && (
                      <span className="inline-flex items-center gap-1.5">
                        <UserIcon className="h-3.5 w-3.5 text-dark/40" /> Paid by: <strong className="text-dark dark:text-light">{payerName}</strong>
                      </span>
                    )}
                    <span>
                      {exp.isPaid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                          <CheckCircleIcon className="h-3.5 w-3.5" /> Settled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                          <ClockIcon className="h-3.5 w-3.5" /> Pending
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-tertiary/20">
              <div className="text-right">
                <span className="sm:hidden text-xs font-bold text-dark/50 dark:text-light/50 mr-2">
                  {isSplit ? 'Your Share:' : 'Amount:'}
                </span>
                <span className="text-xl font-extrabold font-heading text-primary">
                  {currencySymbol}{Number(exp.amount).toFixed(2)}
                </span>
              </div>

              {/* Delete Button Trigger */}
              {onDelete && (
                <button
                  onClick={() => onDelete(exp._id)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shadow-xs"
                  title="Delete Expense"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}