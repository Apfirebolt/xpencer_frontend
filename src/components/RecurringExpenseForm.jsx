'use client';

import { useState } from 'react';
import { 
  CurrencyDollarIcon, 
  TagIcon, 
  DocumentTextIcon, 
  ArrowRightIcon, 
  PlusIcon, 
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { expenseCategories as EXPENSE_CATEGORIES } from '../utils/constants';

const FREQUENCY_OPTIONS = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Yearly', value: 'yearly' }
];

export default function RecurringExpenseForm({ onSubmitBatch, loading }) {
  // State holds an array of recurring expense rows
  const [items, setItems] = useState([
    { amount: '', description: '', category: EXPENSE_CATEGORIES[0], frequency: 'monthly' }
  ]);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleAddRow = () => {
    setItems([
      ...items,
      { amount: '', description: '', category: EXPENSE_CATEGORIES[0], frequency: 'monthly' }
    ]);
  };

  const handleRemoveRow = (index) => {
    if (items.length === 1) return; // Keep at least one row
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate rows
    const isValid = items.every((item) => item.amount && item.description.trim());
    if (!isValid) {
      alert("Please fill in the amount and description for all recurring items.");
      return;
    }

    // Format payload
    const payload = items.map((item) => ({
      amount: parseFloat(item.amount),
      description: item.description.trim(),
      category: item.category,
      frequency: item.frequency
    }));

    onSubmitBatch(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      
      <div className="flex items-center justify-between border-b border-tertiary/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <ArrowPathIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-heading text-dark dark:text-light">Recurring Commitments</h3>
            <p className="text-[11px] text-dark/50 dark:text-light/50">Add subscriptions, rent, or utilities</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddRow}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          <span>Add Another</span>
        </button>
      </div>

      {/* Dynamic Rows Container */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
        {items.map((item, index) => (
          <div 
            key={index}
            className="p-4 rounded-2xl bg-white dark:bg-dark border border-tertiary/20 dark:border-tertiary/10 space-y-3 relative group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-tertiary/20 text-dark/70 dark:text-light/70">
                Item #{index + 1}
              </span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveRow(index)}
                  className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Remove row"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Amount */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-dark/70 dark:text-light/70 uppercase tracking-wider font-heading">
                  Amount ($) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark/30 dark:text-light/30">
                    <CurrencyDollarIcon className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white dark:bg-tertiary/5 border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary text-dark dark:text-light placeholder-dark/30 shadow-inner"
                    placeholder="15.99"
                    required
                  />
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-dark/70 dark:text-light/70 uppercase tracking-wider font-heading">
                  Frequency *
                </label>
                <select
                  value={item.frequency}
                  onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white dark:bg-tertiary/5 border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary text-dark dark:text-light shadow-inner cursor-pointer"
                  required
                >
                  {FREQUENCY_OPTIONS.map((freq) => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-dark/70 dark:text-light/70 uppercase tracking-wider font-heading">
                  Category *
                </label>
                <select
                  value={item.category}
                  onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white dark:bg-tertiary/5 border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary text-dark dark:text-light shadow-inner cursor-pointer"
                  required
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-dark/70 dark:text-light/70 uppercase tracking-wider font-heading">
                  Description / Title *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark/30 dark:text-light/30">
                    <DocumentTextIcon className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white dark:bg-tertiary/5 border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary text-dark dark:text-light placeholder-dark/30 shadow-inner"
                    placeholder="Netflix Membership, Apartment Rent..."
                    required
                  />
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 text-xs font-bold text-white bg-primary hover:bg-secondary rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer"
      >
        <span>{loading ? "Saving Recurring Templates..." : `Save ${items.length} Recurring Expense(s)`}</span>
        <ArrowRightIcon className="h-4 w-4" />
      </button>

    </form>
  );
}