'use client';

import { CalendarIcon, TrashIcon, UserGroupIcon, UserIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function ExpenseListView({ expenses, onDelete }) {
  if (!expenses || expenses.length === 0) return null;

  return (
    <div className="space-y-3 max-w-4xl mx-auto w-full">
      {expenses.map((exp) => {
        const isSplit = exp.isSplit;
        const roomTitle = exp.roomId?.title;
        const payerName = exp.paidBy 
          ? `${exp.paidBy.firstName || ''} ${exp.paidBy.lastName || ''}`.trim() || exp.paidBy.email 
          : null;

        return (
          <div 
            key={exp._id || Math.random()} 
            className={`p-5 rounded-2xl bg-white/80 dark:bg-dark/80 border transition-all shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group ${
              isSplit ? 'border-primary/40 bg-gradient-to-r from-primary/[0.02] to-transparent' : 'border-tertiary/20 dark:border-tertiary/10 hover:border-primary/40'
            }`}
          >
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/25 shrink-0 text-primary font-bold font-heading">
                ${Number(exp.amount).toFixed(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                    {exp.category}
                  </span>

                  {/* Split Expense Badge */}
                  {isSplit && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold font-mono border border-amber-500/20 flex items-center gap-1">
                      <UserGroupIcon className="h-3 w-3" />
                      Split Share
                    </span>
                  )}

                  <span className="text-xs text-dark/40 dark:text-light/40 flex items-center gap-1 font-mono">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : 'Just now'}
                  </span>
                </div>

                <p className="text-sm font-medium text-dark dark:text-light">
                  {exp.description || 'No description provided'}
                </p>

                {/* Split & Room Metadata Details */}
                {isSplit && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-dark/60 dark:text-light/60">
                    {roomTitle && (
                      <span className="inline-flex items-center gap-1 text-primary font-medium">
                        <UserGroupIcon className="h-3 w-3" /> Room: {roomTitle}
                      </span>
                    )}
                    {payerName && (
                      <span className="inline-flex items-center gap-1">
                        <UserIcon className="h-3 w-3 text-dark/40" /> Paid by: <strong className="text-dark dark:text-light">{payerName}</strong>
                      </span>
                    )}
                    <span>
                      {exp.isPaid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircleIcon className="h-3 w-3" /> Settled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                          <ClockIcon className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-tertiary/20">
              <div className="text-right">
                <span className="sm:hidden text-xs font-bold text-dark/50 dark:text-light/50 mr-2">
                  {isSplit ? 'Your Share:' : 'Amount:'}
                </span>
                <span className="text-lg font-extrabold font-heading text-primary">
                  ${Number(exp.amount).toFixed(2)}
                </span>
              </div>

              {/* Delete Button Trigger */}
              {onDelete && (
                <button
                  onClick={() => onDelete(exp._id)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
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