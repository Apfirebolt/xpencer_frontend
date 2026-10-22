'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/context/LanguageContext';
import { currencies } from '@/utils/constants';
import { 
  CurrencyDollarIcon, 
  TagIcon, 
  DocumentTextIcon, 
  ArrowRightIcon, 
  PlusIcon, 
  TrashIcon,
  ArrowPathIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { expenseCategories as EXPENSE_CATEGORIES } from '../utils/constants';

const FREQUENCY_OPTIONS = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Yearly', value: 'yearly' }
];

export default function RecurringExpenseForm({ onSubmitBatch, loading }) {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  // Extract user preferred currency symbol
  const userCurrencyCode = user?.settings?.currency || 'USD';
  const currencyObj = currencies.find((c) => c.code === userCurrencyCode) || { symbol: '$', code: 'USD' };
  const currencySymbol = currencyObj.symbol;

  // State holds an array of recurring expense rows including billingDate
  const [items, setItems] = useState([
    { amount: '', description: '', category: EXPENSE_CATEGORIES[0], frequency: 'monthly', billingDate: '1' }
  ]);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleAddRow = () => {
    setItems([
      ...items,
      { amount: '', description: '', category: EXPENSE_CATEGORIES[0], frequency: 'monthly', billingDate: '1' }
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
    const isValid = items.every((item) => item.amount && item.description.trim() && item.billingDate);
    if (!isValid) {
      alert(t("recurringForm.validationAlert") || "Please fill in the amount, description, and billing date for all recurring items.");
      return;
    }

    // Format payload
    const payload = items.map((item) => ({
      amount: parseFloat(item.amount),
      description: item.description.trim(),
      category: item.category,
      frequency: item.frequency,
      billingDate: parseInt(item.billingDate, 10)
    }));

    onSubmitBatch(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      
      <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-xs">
            <ArrowPathIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-heading text-dark dark:text-light">
              {t("recurringForm.headerTitle") || "Recurring Commitments"}
            </h3>
            <p className="text-xs text-dark/50 dark:text-light/50">
              {t("recurringForm.headerDesc") || "Add subscriptions, rent, or utilities"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddRow}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <PlusIcon className="h-4 w-4" />
          <span>{t("recurringForm.addAnotherBtn") || "Add Another"}</span>
        </button>
      </div>

      {/* Dynamic Rows Container */}
      <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
        {items.map((item, index) => (
          <div 
            key={index}
            className="p-5 rounded-[1.5rem] bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 space-y-4 relative group shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                {t("recurringForm.itemLabel") || "Item"} #{index + 1}
              </span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveRow(index)}
                  className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shadow-xs"
                  title={t("recurringForm.removeRowTitle") || "Remove row"}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Amount */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-dark/70 dark:text-light/70 uppercase tracking-wider font-heading">
                  {t("recurringForm.amountLabel") || `Amount (${currencySymbol}) *`}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark/40 dark:text-light/40 font-mono font-bold text-xs">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    className="w-full pl-9 pr-3.5 py-3 text-xs bg-white dark:bg-dark border border-tertiary/30 rounded-2xl focus:outline-none focus:border-primary text-dark dark:text-light placeholder-dark/30 shadow-inner font-mono font-semibold"
                    placeholder="15.99"
                    required
                  />
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-dark/70 dark:text-light/70 uppercase tracking-wider font-heading">
                  {t("recurringForm.frequencyLabel") || "Frequency *"}
                </label>
                <select
                  value={item.frequency}
                  onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                  className="w-full px-3.5 py-3 text-xs bg-white dark:bg-dark border border-tertiary/30 rounded-2xl focus:outline-none focus:border-primary text-dark dark:text-light shadow-inner cursor-pointer"
                  required
                >
                  {FREQUENCY_OPTIONS.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {t(`recurringForm.freq_${freq.value}`) || freq.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Billing Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-dark/70 dark:text-light/70 uppercase tracking-wider font-heading">
                  {t("recurringForm.billingDayLabel") || "Billing Day *"}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark/40 dark:text-light/40">
                    <CalendarIcon className="h-4 w-4" />
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={item.billingDate}
                    onChange={(e) => handleItemChange(index, 'billingDate', e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 text-xs bg-white dark:bg-dark border border-tertiary/30 rounded-2xl focus:outline-none focus:border-primary text-dark dark:text-light placeholder-dark/30 shadow-inner font-mono"
                    placeholder="1"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-dark/70 dark:text-light/70 uppercase tracking-wider font-heading">
                  {t("recurringForm.categoryLabel") || "Category *"}
                </label>
                <select
                  value={item.category}
                  onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                  className="w-full px-3.5 py-3 text-xs bg-white dark:bg-dark border border-tertiary/30 rounded-2xl focus:outline-none focus:border-primary text-dark dark:text-light shadow-inner cursor-pointer"
                  required
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-dark/70 dark:text-light/70 uppercase tracking-wider font-heading">
                  {t("recurringForm.descriptionLabel") || "Description / Title *"}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark/40 dark:text-light/40">
                    <DocumentTextIcon className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 text-xs bg-white dark:bg-dark border border-tertiary/30 rounded-2xl focus:outline-none focus:border-primary text-dark dark:text-light placeholder-dark/30 shadow-inner font-semibold"
                    placeholder={t("recurringForm.descriptionPlaceholder") || "Netflix Membership, Apartment Rent..."}
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
        className="w-full py-4 text-xs font-bold text-white bg-primary hover:bg-secondary rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer"
      >
        <span>
          {loading 
            ? (t("recurringForm.saving") || "Saving Recurring Templates...") 
            : `${t("recurringForm.saveBtnPrefix") || "Save"} ${items.length} ${t("recurringForm.saveBtnSuffix") || "Recurring Expense(s)"}`}
        </span>
        <ArrowRightIcon className="h-4 w-4" />
      </button>

    </form>
  );
}