'use client';

import { CalendarIcon, TagIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function ExpenseCardView({ expenses, onDelete }) {
  if (!expenses || expenses.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {expenses.map((exp) => (
        <div 
          key={exp._id || Math.random()} 
          className="p-6 rounded-3xl bg-white/80 dark:bg-dark/80 border border-tertiary/20 dark:border-tertiary/10 flex flex-col justify-between space-y-4 shadow-sm hover:border-primary/50 hover:shadow-xl transition-all group"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold font-mono border border-primary/20">
                {exp.category}
              </span>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-dark/40 dark:text-light/40 flex items-center gap-1 font-mono">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : 'Just now'}
                </span>

                {/* Delete Button Trigger */}
                {onDelete && (
                  <button
                    onClick={() => onDelete(exp._id)}
                    className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Delete Expense"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-sm font-medium text-dark dark:text-light leading-relaxed">
              {exp.description || 'No description provided'}
            </p>
          </div>

          <div className="pt-4 border-t border-tertiary/20 dark:border-tertiary/10 flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-dark/40 dark:text-light/40 font-heading">Amount</span>
            <span className="text-xl font-extrabold font-heading text-primary">
              ${Number(exp.amount).toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}