'use client';

import { useState, useEffect, Fragment } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BudgetForm from '@/components/BudgetForm';
import BudgetComparisonChart from '@/components/BudgetComparisonChart';
import ConfirmModal from '@/components/ConfirmModal';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/context/LanguageContext';
import { currencies } from '@/utils/constants';
import httpClient from '@/lib/api';
import Cookie from 'js-cookie';
import { 
  ChartPieIcon, 
  PlusCircleIcon, 
  CurrencyDollarIcon, 
  CalendarDaysIcon, 
  XMarkIcon, 
  TrashIcon, 
  ScaleIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const getAuthHeaders = () => {
  const token = Cookie.get('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export default function BudgetClient() {
  const { 
    budgets, 
    fetching, 
    loading, 
    error, 
    fetchBudgets, 
    setBudget, 
    deleteBudget, 
    selectedMonth, 
    selectedYear, 
    setMonthYear, 
    getTotalBudgetLimit, 
    getTotalBudgetSpent 
  } = useBudgetStore();

  const { user, initializeAuth } = useAuthStore();
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [budgetToDeleteId, setBudgetToDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Comparison State
  const [compareMonth2, setCompareMonth2] = useState(selectedMonth === 1 ? 12 : selectedMonth - 1);
  const [compareYear2, setCompareYear2] = useState(selectedMonth === 1 ? selectedYear - 1 : selectedYear);
  const [comparisonData, setComparisonData] = useState(null);
  const [comparingLoading, setComparingLoading] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    initializeAuth();
    fetchBudgets(selectedMonth, selectedYear);
  }, [fetchBudgets, initializeAuth, selectedMonth, selectedYear]);

  // Extract user preferred currency symbol
  const userCurrencyCode = user?.settings?.currency || 'USD';
  const currencyObj = currencies.find((c) => c.code === userCurrencyCode) || { symbol: '$', code: 'USD' };
  const currencySymbol = currencyObj.symbol;

  async function handleSaveBudget(budgetData) {
    setSuccessMessage('');
    const result = await setBudget(budgetData);

    if (result.success) {
      setSuccessMessage(t?.budget?.successSaved || 'Budget successfully saved!');
      setTimeout(() => {
        setSuccessMessage('');
        setIsModalOpen(false);
      }, 1500);
    }
  }

  // Prompt confirmation modal for budget deletion
  const promptDeleteBudget = (id) => {
    setBudgetToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Execute deletion upon confirmation
  const handleConfirmDelete = async () => {
    if (!budgetToDeleteId) return;
    setDeleting(true);

    try {
      await deleteBudget(budgetToDeleteId);
      setIsDeleteModalOpen(false);
      setBudgetToDeleteId(null);
    } catch (err) {
      console.error("Failed to delete budget:", err);
    } finally {
      setDeleting(false);
    }
  };

  // Fetch comparison data between Month 1 (selected) and Month 2
  async function handleRunComparison() {
    setComparingLoading(true);
    try {
      const res2 = await httpClient.get(`/budget?month=${compareMonth2}&year=${compareYear2}`, getAuthHeaders());
      const month2Budgets = res2.data.budgets || res2.data || [];

      setComparisonData({
        month1: { month: selectedMonth, year: selectedYear, budgets },
        month2: { month: Number(compareMonth2), year: Number(compareYear2), budgets: month2Budgets }
      });
    } catch (err) {
      console.error("Failed to fetch comparison data:", err);
    } finally {
      setComparingLoading(false);
    }
  }

  const totalLimit = getTotalBudgetLimit();
  const totalSpent = getTotalBudgetSpent();
  const overallPercentage = totalLimit > 0 ? Math.min(Math.round((totalSpent / totalLimit) * 100), 100) : 0;

  // Compute totals for comparison month 2
  const month2Limit = comparisonData?.month2.budgets.reduce((acc, b) => acc + Number(b.limit || 0), 0) || 0;
  const month2Spent = comparisonData?.month2.budgets.reduce((acc, b) => acc + Number(b.spent || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light flex flex-col font-sans selection:bg-primary selection:text-white transition-colors duration-200">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-16 space-y-10">
        
        {/* Page Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-tertiary/20 pb-6" data-aos="fade-down">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase border border-primary/20 mb-3">
              <ChartPieIcon className="h-4 w-4" />
              <span>{t("budget.badge") || "Budget Planner"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              {t("budget.title") || "Category Budgets"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Month Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setMonthYear(Number(e.target.value), selectedYear)}
              className="px-4 py-3 text-xs font-bold bg-white dark:bg-tertiary/5 border border-tertiary/20 rounded-2xl shadow-sm focus:outline-none focus:border-primary cursor-pointer font-mono"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>{name} {selectedYear}</option>
              ))}
            </select>

            {/* Compare 2 Months Button */}
            <button
              onClick={() => { setIsCompareModalOpen(true); handleRunComparison(); }}
              className="px-5 py-3 rounded-2xl font-bold bg-tertiary/20 hover:bg-tertiary/30 text-dark dark:text-light border border-tertiary/30 transition-all flex items-center gap-2 cursor-pointer shrink-0 text-xs shadow-sm"
            >
              <ScaleIcon className="h-4 w-4 text-primary" />
              <span>{t("budget.compareMonths") || "Compare Months"}</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 rounded-2xl font-bold bg-primary hover:bg-secondary text-white transition-all shadow-lg shadow-primary/25 flex items-center gap-2 cursor-pointer shrink-0 text-xs"
            >
              <PlusCircleIcon className="h-5 w-5" />
              <span>{t("budget.setBudget") || "Set Budget"}</span>
            </button>
          </div>
        </div>

        {/* Overview Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" data-aos="fade-up">
          <div className="p-6 rounded-3xl bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 space-y-2 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <p className="text-xs uppercase font-bold text-dark/50 dark:text-light/50 font-heading">{t("budget.totalBudgeted") || "Total Budgeted"}</p>
            <p className="text-3xl font-extrabold font-heading text-primary">
              {currencySymbol}{totalLimit.toFixed(2)}
            </p>
            <p className="text-[11px] text-dark/50 dark:text-light/50 font-mono">For {MONTH_NAMES[selectedMonth - 1]}</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 space-y-2 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <p className="text-xs uppercase font-bold text-dark/50 dark:text-light/50 font-heading">{t("budget.totalSpent") || "Total Spent"}</p>
            <p className="text-3xl font-extrabold font-heading text-dark dark:text-light">
              {currencySymbol}{totalSpent.toFixed(2)}
            </p>
            <p className="text-[11px] text-dark/50 dark:text-light/50 font-mono">Real-time ledger tracking</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 space-y-2 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <p className="text-xs uppercase font-bold text-dark/50 dark:text-light/50 font-heading">{t("budget.overallUsage") || "Overall Usage"}</p>
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-extrabold font-heading text-primary">{overallPercentage}%</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${overallPercentage > 90 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                {overallPercentage > 90 ? 'High Burn' : 'On Track'}
              </span>
            </div>
            <div className="w-full bg-tertiary/20 rounded-full h-1.5 overflow-hidden">
              <div className={`h-full rounded-full ${overallPercentage > 90 ? 'bg-rose-500' : 'bg-primary'}`} style={{ width: `${overallPercentage}%` }} />
            </div>
          </div>
        </div>

        {/* Budgets List Grid */}
        <div className="space-y-6" data-aos="fade-up" data-aos-delay="100">
          <div className="flex items-center justify-between border-b border-tertiary/20 pb-3">
            <h2 className="text-xl font-bold font-heading">
              {t("budget.allocationsFor") || "Allocations for"} {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary font-mono">
              {budgets.length} Categories Configured
            </span>
          </div>

          {fetching ? (
            <div className="p-12 text-center text-sm text-dark/50 dark:text-light/50 bg-white/50 dark:bg-dark/50 rounded-3xl border border-tertiary/20">
              {t("budget.loadingBudgets") || "Loading budgets..."}
            </div>
          ) : budgets.length === 0 ? (
            <div className="p-16 text-center space-y-4 max-w-md mx-auto bg-white/50 dark:bg-dark/50 rounded-3xl border border-tertiary/20">
              <ChartPieIcon className="h-12 w-12 text-primary mx-auto opacity-50" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-dark dark:text-light">{t("budget.noBudgets") || "No budgets set for this month"}</p>
                <p className="text-xs text-dark/60 dark:text-light/60">{t("budget.noBudgetsDesc") || "Create category limits to track your monthly spending pace."}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary transition-all border border-primary/20 cursor-pointer"
              >
                {t("budget.setFirstBudget") || "Set First Budget"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map((b) => {
                const isOverBudget = b.spent > b.limit;
                return (
                  <div 
                    key={b._id} 
                    className="p-6 rounded-3xl bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 flex flex-col justify-between space-y-6 shadow-sm hover:border-primary/50 transition-all group relative"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold font-mono border border-primary/20">
                          {b.category}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {isOverBudget && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                              <ExclamationTriangleIcon className="h-3 w-3" /> Over Limit
                            </span>
                          )}
                          <button
                            onClick={() => promptDeleteBudget(b._id)}
                            className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title={t("budget.deleteModalTitle") || "Delete Budget"}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-baseline pt-1">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-dark/40 dark:text-light/40 font-heading">{t("budget.spent") || "Spent"}</p>
                          <p className={`text-xl font-extrabold font-heading ${isOverBudget ? 'text-rose-500' : 'text-dark dark:text-light'}`}>
                            {currencySymbol}{Number(b.spent || 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold text-dark/40 dark:text-light/40 font-heading">{t("budget.limit") || "Limit"}</p>
                          <p className="text-xl font-extrabold font-heading text-primary">
                            {currencySymbol}{Number(b.limit).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2 pt-2">
                        <div className="w-full bg-tertiary/20 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500' : 'bg-primary'}`} 
                            style={{ width: `${Math.min(b.percentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] font-mono text-dark/60 dark:text-light/60">
                          <span className="font-bold">{b.percentage}% used</span>
                          <span>{t("budget.rem") || "Rem"}: {currencySymbol}{Number(b.remaining).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {b.description && (
                      <p className="text-xs text-dark/60 dark:text-light/60 italic border-t border-tertiary/20 pt-3">
                        &quot;{b.description}&quot;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* 1. Set Budget Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
          <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm" />
          </TransitionChild>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-dark border border-tertiary/20 p-8 text-left align-middle shadow-2xl transition-all space-y-6">
                  <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <ChartPieIcon className="h-5 w-5 text-primary" />
                      </div>
                      <DialogTitle as="h3" className="text-lg font-bold font-heading text-dark dark:text-light">
                        {t("budget.modalTitle") || "Set Monthly Budget"}
                      </DialogTitle>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-xl text-dark/50 hover:bg-primary/10 hover:text-primary cursor-pointer">
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                  {error && <div className="text-xs text-rose-600 bg-rose-500/10 p-3 rounded-xl font-medium">{error}</div>}
                  {successMessage && <div className="text-xs text-emerald-600 bg-emerald-500/10 p-3 rounded-xl font-medium">{successMessage}</div>}
                  <BudgetForm onSubmitBudget={handleSaveBudget} loading={loading} />
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* 2. Compare 2 Months Modal */}
      <Transition appear show={isCompareModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsCompareModalOpen(false)}>
          <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm" />
          </TransitionChild>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white dark:bg-dark border border-tertiary/20 p-8 text-left align-middle shadow-2xl transition-all space-y-6">
                  
                  <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <ScaleIcon className="h-5 w-5 text-primary" />
                      </div>
                      <DialogTitle as="h3" className="text-lg font-bold font-heading text-dark dark:text-light">
                        {t("budget.compareModalTitle") || "Compare Budget & Expenses Across Two Months"}
                      </DialogTitle>
                    </div>
                    <button onClick={() => setIsCompareModalOpen(false)} className="p-1.5 rounded-xl text-dark/50 hover:bg-primary/10 hover:text-primary cursor-pointer">
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Comparison Month Pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-tertiary/5 border border-tertiary/20">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase font-heading">{t("budget.primaryMonth") || "Primary Month"}</label>
                      <div className="px-4 py-3 rounded-xl bg-white dark:bg-dark border border-tertiary/30 text-sm font-bold font-mono">
                        {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase font-heading">{t("budget.comparisonMonth") || "Comparison Month"}</label>
                      <select
                        value={compareMonth2}
                        onChange={(e) => setCompareMonth2(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-dark border border-tertiary/30 text-sm font-bold focus:outline-none focus:border-primary cursor-pointer font-mono"
                      >
                        {MONTH_NAMES.map((name, idx) => (
                          <option key={name} value={idx + 1}>{name} {selectedYear}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleRunComparison}
                    disabled={comparingLoading}
                    className="w-full py-3 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-xl transition-all shadow-lg cursor-pointer"
                  >
                    {comparingLoading ? (t("budget.comparing") || "Comparing...") : (t("budget.runComparison") || "Run Comparison")}
                  </button>

                  {/* Comparison Results */}
                  {comparisonData && (
                    <div className="space-y-6 pt-4 border-t border-tertiary/20">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-1">
                          <p className="text-xs font-bold text-dark/60">{MONTH_NAMES[comparisonData.month1.month - 1]} {comparisonData.month1.year}</p>
                          <p className="text-sm font-semibold">{t("budget.budgetLabel") || "Budget"}: <span className="text-primary font-bold">{currencySymbol}{totalLimit.toFixed(2)}</span></p>
                          <p className="text-sm font-semibold">{t("budget.spentLabel") || "Spent"}: <span className="font-bold">{currencySymbol}{totalSpent.toFixed(2)}</span></p>
                        </div>
                        <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10 space-y-1">
                          <p className="text-xs font-bold text-dark/60">{MONTH_NAMES[comparisonData.month2.month - 1]} {comparisonData.month2.year}</p>
                          <p className="text-sm font-semibold">{t("budget.budgetLabel") || "Budget"}: <span className="text-primary font-bold">{currencySymbol}{month2Limit.toFixed(2)}</span></p>
                          <p className="text-sm font-semibold">{t("budget.spentLabel") || "Spent"}: <span className="font-bold">{currencySymbol}{month2Spent.toFixed(2)}</span></p>
                        </div>
                      </div>

                      {/* Render professional comparison charts */}
                      <BudgetComparisonChart comparisonData={comparisonData} />

                      {/* Variance summary */}
                      <div className="p-4 rounded-2xl bg-tertiary/5 border border-tertiary/20 flex justify-between items-center text-xs font-bold">
                        <span>{t("budget.spendingVariance") || "Spending Variance"}:</span>
                        <span className={totalSpent >= month2Spent ? 'text-rose-500' : 'text-emerald-500'}>
                          {currencySymbol}{(totalSpent - month2Spent).toFixed(2)} ({((totalSpent - (month2Spent || 1)) / (month2Spent || 1) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  )}

                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* 3. Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("budget.deleteModalTitle") || "Delete Budget Limit"}
        message={t("budget.deleteModalMessage") || "Are you sure you want to delete this category budget? This will remove your spending limits for the selected month."}
        confirmText={t("budget.deleteConfirmText") || "Yes, Delete"}
        loading={deleting}
      />

      <Footer />
    </div>
  );
}