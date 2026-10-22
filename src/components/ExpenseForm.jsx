'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { currencies } from '@/utils/constants';
import { CurrencyDollarIcon, TagIcon, DocumentTextIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { expenseCategories as EXPENSE_CATEGORIES, expenseMode as EXPENSE_MODES, expenseTypes as EXPENSE_TYPES } from '../utils/constants';

export default function ExpenseForm({ onSubmitExpense, loading }) {
  const { user } = useAuthStore();

  // Extract user preferred currency symbol
  const userCurrencyCode = user?.settings?.currency || 'USD';
  const currencyObj = currencies.find((c) => c.code === userCurrencyCode) || { symbol: '$', code: 'USD' };
  const currencySymbol = currencyObj.symbol;

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [mode, setMode] = useState(EXPENSE_MODES[0]);
  const [description, setDescription] = useState('');
  const [expenseType, setExpenseType] = useState(EXPENSE_TYPES[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !category || !expenseType || !mode) return;

    onSubmitExpense({
      amount: parseFloat(amount),
      category,
      type: expenseType,
      mode,          // Cash, UPI, Card, etc.
      description: description.trim() || 'No description provided'
    });

    // Clear form on submit
    setAmount('');
    setDescription('');
    setCategory(EXPENSE_CATEGORIES[0]);
    setExpenseType(EXPENSE_TYPES[0]);
    setMode(EXPENSE_MODES[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      
      {/* Amount Field */}
      <div className="space-y-2">
        <label htmlFor="amount" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
          Amount ({currencySymbol}) *
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-dark/40 dark:text-light/40 font-mono font-bold">
            {currencySymbol}
          </span>
          <input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-2xl focus:outline-none focus:border-primary text-dark dark:text-light placeholder-dark/30 dark:placeholder-light/30 shadow-inner font-mono font-semibold"
            placeholder="45.50"
            required
          />
        </div>
      </div>

      {/* Category Type Field */}
      <div className="space-y-2">
        <label htmlFor="category" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
          Category Type *
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

      {/* Expense Mode Field */}
      <div className="space-y-2">
        <label htmlFor="expenseMode" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
          Payment Mode *
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-dark/40 dark:text-light/40">
            <CurrencyDollarIcon className="h-4 w-4" />
          </span>
          <select
            id="expenseMode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-2xl focus:outline-none focus:border-primary text-dark dark:text-light shadow-inner cursor-pointer"
            required
          >
            {EXPENSE_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description Field (Expanded Rows) */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
          Description / Notes
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
            placeholder="Add detailed notes about this transaction (e.g., Lunch meeting with client at cafeteria)..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer"
      >
        <span>{loading ? "Saving Expense..." : "Record Expense"}</span>
        <ArrowRightIcon className="h-4 w-4" />
      </button>

    </form>
  );
}