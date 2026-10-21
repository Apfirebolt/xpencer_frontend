'use client';

import { useTranslation } from '@/context/LanguageContext';
import { CalendarIcon, TrashIcon, UserGroupIcon, UserIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function ExpenseCardView({ expenses, onDelete, markSplitPaymentPaid }) {
  const { t } = useTranslation();

  if (!expenses || expenses.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {expenses.map((exp) => {
        const isSplit = exp.isSplit;
        const roomTitle = exp.roomId?.title;
        const payerName = exp.paidBy 
          ? `${exp.paidBy.firstName || ''} ${exp.paidBy.lastName || ''}`.trim() || exp.paidBy.email 
          : null;
        
        const settlementStatus = exp.settlementStatus || 'unpaid';

        return (
          <div 
            key={exp._id || Math.random()} 
            className={`p-6 rounded-3xl bg-white/80 dark:bg-dark/80 border transition-all duration-300 flex flex-col justify-between space-y-4 shadow-sm group hover:shadow-xl ${
              isSplit ? 'border-primary/40 bg-gradient-to-b from-primary/[0.02] to-transparent' : 'border-tertiary/20 dark:border-tertiary/10 hover:border-primary/50'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold font-mono border border-primary/20">
                    {exp.category}
                  </span>

                  {/* Split Expense Badge */}
                  {isSplit && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold font-mono border border-amber-500/20 flex items-center gap-1">
                      <UserGroupIcon className="h-3 w-3" />
                      {t('expenseCard.splitShare') || 'Split Share'}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-dark/40 dark:text-light/40 flex items-center gap-1 font-mono">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : (t('expenseCard.justNow') || 'Just now')}
                  </span>

                  {/* Delete Button Trigger */}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(exp._id)}
                      className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      title={t('expenseCard.deleteExpense') || 'Delete Expense'}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm font-medium text-dark dark:text-light leading-relaxed">
                {exp.description || (t('expenseCard.noDescription') || 'No description provided')}
              </p>

              {/* Split & Room Metadata Footer Info */}
              {isSplit && (
                <div className="space-y-2 pt-2 border-t border-tertiary/10 text-xs text-dark/60 dark:text-light/60">
                  {roomTitle && (
                    <div className="flex items-center gap-1.5 font-medium text-primary">
                      <UserGroupIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{t('expenseCard.room') || 'Room'}: {roomTitle}</span>
                    </div>
                  )}

                  {payerName && (
                    <div className="flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5 shrink-0 text-dark/40" />
                      <span className="truncate">{t('expenseCard.paidBy') || 'Paid by'}: <strong className="text-dark dark:text-light">{payerName}</strong></span>
                    </div>
                  )}

                  {/* Two-Step Settlement Status & Action Button */}
                  <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
                    {settlementStatus === 'settled' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircleIcon className="h-3.5 w-3.5" /> {t('expenseCard.settled') || 'Settled / Paid'}
                      </span>
                    ) : settlementStatus === 'pending_confirmation' ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold italic bg-amber-500/10 px-2.5 py-1 rounded-lg">
                        <ClockIcon className="h-3.5 w-3.5 animate-spin" /> {t('expenseCard.awaitingConfirmation') || 'Awaiting payer confirmation'}
                      </span>
                    ) : (
                      <div className="flex items-center justify-between w-full pt-1">
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                          <ClockIcon className="h-3.5 w-3.5" /> {t('expenseCard.pending') || 'Unpaid Share'}
                        </span>
                        
                        <button
                            onClick={() => markSplitPaymentPaid(exp._id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-all cursor-pointer flex items-center gap-1 border border-amber-500/20 shadow-sm"
                          >
                            <ClockIcon className="h-3.5 w-3.5" /> {t('expenseCard.markPaid') || 'Mark as Paid'}
                          </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-tertiary/20 dark:border-tertiary/10 flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-dark/40 dark:text-light/40 font-heading">
                {isSplit ? (t('expenseCard.yourShare') || 'Your Share') : (t('expenseCard.amount') || 'Amount')}
              </span>
              <span className="text-xl font-extrabold font-heading text-primary">
                ${Number(exp.amount).toFixed(2)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}