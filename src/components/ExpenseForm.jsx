'use client';

import { useState } from 'react';
import { CurrencyDollarIcon, TagIcon, DocumentTextIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

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

export default function ExpenseForm({ onSubmitExpense, loading }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !type) return;

    onSubmitExpense({
      amount: parseFloat(amount),
      type,
      description: description.trim()
    });

    // Clear form on submit
    setAmount('');
    setDescription('');
    setType(EXPENSE_CATEGORIES[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-sans">
      
      {/* Amount Field */}
      <div className="space-y-1.5">
        <label htmlFor="amount" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
          Amount ($) *
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark/30 dark:text-light/30">
            <CurrencyDollarIcon className="h-4 w-4" />
          </span>
          <input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary text-dark dark:text-light placeholder-dark/30 dark:placeholder-light/30 shadow-inner"
            placeholder="45.50"
            required
          />
        </div>
      </div>

      {/* Category Type Field */}
      <div className="space-y-1.5">
        <label htmlFor="type" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
          Category Type *
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark/30 dark:text-light/30">
            <TagIcon className="h-4 w-4" />
          </span>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary text-dark dark:text-light shadow-inner cursor-pointer"
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

      {/* Description Field */}
      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
          Description
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-3.5 top-3.5 pointer-events-none text-dark/30 dark:text-light/30">
            <DocumentTextIcon className="h-4 w-4" />
          </span>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary text-dark dark:text-light placeholder-dark/30 dark:placeholder-light/30 shadow-inner"
            placeholder="Lunch at cafeteria..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer"
      >
        <span>{loading ? "Saving Expense..." : "Add Expense"}</span>
        <ArrowRightIcon className="h-4 w-4" />
      </button>

    </form>
  );
}