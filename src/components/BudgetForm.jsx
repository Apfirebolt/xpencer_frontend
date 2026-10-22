'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { currencies } from '@/utils/constants';
import { TagIcon, CurrencyDollarIcon, CalendarIcon, DocumentTextIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Bills & Utilities",
  "Entertainment",
  "Health & Fitness",
  "Travel",
  "Other"
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export default function BudgetForm({ onSubmitBudget, loading }) {
  const { user } = useAuthStore();

  // Extract user preferred currency symbol
  const userCurrencyCode = user?.settings?.currency || 'USD';
  const currencyObj = currencies.find((c) => c.code === userCurrencyCode) || { symbol: '$', code: 'USD' };
  const currencySymbol = currencyObj.symbol;

  const currentDate = new Date();
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [limit, setLimit] = useState('');
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!limit || !category) return;

    onSubmitBudget({
      category,
      limit: parseFloat(limit),
      month: Number(month),
      year: Number(year),
      description: description.trim()
    });

    setLimit('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      
      {/* Category Selection */}
      <div className="space-y-2">
        <label htmlFor="category" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
          Category *
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-dark/40 dark:text-light/40">
            <TagIcon className="h-4 w-4" />
          </span>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-2xl focus:outline-none focus:border-primary text-dark dark:text-light shadow-inner cursor-pointer"
            required
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Spending Limit Amount */}
      <div className="space-y-2">
        <label htmlFor="limit" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
          Monthly Limit ({currencySymbol}) *
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-dark/40 dark:text-light/40 font-mono font-bold">
            {currencySymbol}
          </span>
          <input
            id="limit"
            type="number"
            step="0.01"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-2xl focus:outline-none focus:border-primary text-dark dark:text-light placeholder-dark/30 dark:placeholder-light/30 shadow-inner font-mono font-semibold"
            placeholder="500.00"
            required
          />
        </div>
      </div>

      {/* Month & Year Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="month" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
            Month *
          </label>
          <select
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-4 py-3.5 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-2xl focus:outline-none focus:border-primary text-dark dark:text-light shadow-inner cursor-pointer"
            required
          >
            {MONTH_NAMES.map((m, idx) => (
              <option key={m} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="year" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
            Year *
          </label>
          <input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full px-4 py-3.5 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-2xl focus:outline-none focus:border-primary text-dark dark:text-light shadow-inner font-mono"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
          Description / Note
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-4 top-4 pointer-events-none text-dark/40 dark:text-light/40">
            <DocumentTextIcon className="h-4 w-4" />
          </span>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-2xl focus:outline-none focus:border-primary text-dark dark:text-light placeholder-dark/30 dark:placeholder-light/30 shadow-inner resize-none leading-relaxed"
            placeholder="Monthly dining allowance and restaurant cap..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer"
      >
        <span>{loading ? "Saving Budget..." : "Save Budget"}</span>
        <ArrowRightIcon className="h-4 w-4" />
      </button>

    </form>
  );
}