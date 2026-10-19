'use client';

import { useState, useEffect, Fragment } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BudgetForm from '@/components/BudgetForm';
import { useBudgetStore } from '@/store/useBudgetStore';
import { ChartPieIcon, PlusCircleIcon, CurrencyDollarIcon, CalendarDaysIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    fetchBudgets(selectedMonth, selectedYear);
  }, [fetchBudgets, selectedMonth, selectedYear]);

  async function handleSaveBudget(budgetData) {
    setSuccessMessage('');
    const result = await setBudget(budgetData);

    if (result.success) {
      setSuccessMessage('Budget successfully saved!');
      setTimeout(() => {
        setSuccessMessage('');
        setIsModalOpen(false);
      }, 1500);
    }
  }

  async function handleDelete(id) {
    if (confirm("Are you sure you want to delete this budget limit?")) {
      await deleteBudget(id);
    }
  }

  const totalLimit = getTotalBudgetLimit();
  const totalSpent = getTotalBudgetSpent();
  const overallPercentage = totalLimit > 0 ? Math.min(Math.round((totalSpent / totalLimit) * 100), 100) : 0;

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light flex flex-col font-sans selection:bg-primary selection:text-white transition-colors duration-200">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-16 space-y-10">
        
        {/* Page Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-tertiary/20 pb-6" data-aos="fade-down">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase border border-primary/20 mb-3">
              <ChartPieIcon className="h-4 w-4" />
              <span>Budget Planner</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              Category Budgets
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Month Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setMonthYear(Number(e.target.value), selectedYear)}
              className="px-4 py-3 text-xs font-bold bg-white dark:bg-tertiary/5 border border-tertiary/20 rounded-2xl shadow-sm focus:outline-none focus:border-primary cursor-pointer"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>{name} {selectedYear}</option>
              ))}
            </select>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 rounded-2xl font-bold bg-primary hover:bg-secondary text-white transition-all shadow-lg shadow-primary/25 flex items-center gap-2 cursor-pointer shrink-0 text-xs"
            >
              <PlusCircleIcon className="h-4 w-4" />
              <span>Set Budget</span>
            </button>
          </div>
        </div>

        {/* Overview Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" data-aos="fade-up">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-dark/80 border border-tertiary/20 dark:border-tertiary/10 space-y-1 shadow-sm">
            <p className="text-xs uppercase font-bold text-dark/50 dark:text-light/50 font-heading">Total Budgeted</p>
            <p className="text-2xl font-extrabold font-heading text-primary">${totalLimit.toFixed(2)}</p>
          </div>
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-dark/80 border border-tertiary/20 dark:border-tertiary/10 space-y-1 shadow-sm">
            <p className="text-xs uppercase font-bold text-dark/50 dark:text-light/50 font-heading">Total Spent</p>
            <p className="text-2xl font-extrabold font-heading text-dark dark:text-light">${totalSpent.toFixed(2)}</p>
          </div>
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-dark/80 border border-tertiary/20 dark:border-tertiary/10 space-y-1 shadow-sm">
            <p className="text-xs uppercase font-bold text-dark/50 dark:text-light/50 font-heading">Overall Usage</p>
            <p className="text-2xl font-extrabold font-heading text-primary">{overallPercentage}%</p>
          </div>
        </div>

        {/* Budgets List Grid */}
        <div className="space-y-6" data-aos="fade-up" data-aos-delay="100">
          <h2 className="text-xl font-bold font-heading">
            Allocations for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </h2>

          {fetching ? (
            <div className="p-12 text-center text-sm text-dark/50 dark:text-light/50 bg-white/50 dark:bg-dark/50 rounded-3xl border border-tertiary/20">
              Loading budgets...
            </div>
          ) : budgets.length === 0 ? (
            <div className="p-16 text-center space-y-4 max-w-md mx-auto bg-white/50 dark:bg-dark/50 rounded-3xl border border-tertiary/20">
              <ChartPieIcon className="h-12 w-12 text-primary mx-auto opacity-50" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-dark dark:text-light">No budgets set for this month</p>
                <p className="text-xs text-dark/60 dark:text-light/60">Create category limits to track your monthly spending pace.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary transition-all border border-primary/20 cursor-pointer"
              >
                Set First Budget
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map((b) => {
                const isOverBudget = b.spent > b.limit;
                return (
                  <div 
                    key={b._id} 
                    className="p-6 rounded-3xl bg-white/80 dark:bg-dark/80 border border-tertiary/20 dark:border-tertiary/10 flex flex-col justify-between space-y-6 shadow-sm hover:border-primary/50 transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold font-mono border border-primary/20">
                          {b.category}
                        </span>
                        <button
                          onClick={() => handleDelete(b._id)}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Budget"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex justify-between items-baseline pt-2">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-dark/40 dark:text-light/40 font-heading">Spent</p>
                          <p className={`text-lg font-extrabold font-heading ${isOverBudget ? 'text-rose-500' : 'text-dark dark:text-light'}`}>
                            ${Number(b.spent || 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold text-dark/40 dark:text-light/40 font-heading">Limit</p>
                          <p className="text-lg font-extrabold font-heading text-primary">
                            ${Number(b.limit).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-2">
                        <div className="w-full bg-tertiary/20 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500' : 'bg-primary'}`} 
                            style={{ width: `${Math.min(b.percentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] font-mono text-dark/60 dark:text-light/60">
                          <span>{b.percentage}% used</span>
                          <span>Rem: ${Number(b.remaining).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {b.description && (
                      <p className="text-xs text-dark/60 dark:text-light/60 italic border-t border-tertiary/20 pt-3">
                        "{b.description}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* Headless UI Modal for Setting Budget */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-dark border border-tertiary/20 dark:border-tertiary/10 p-8 text-left align-middle shadow-2xl transition-all space-y-6">
                  
                  <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <ChartPieIcon className="h-5 w-5 text-primary" />
                      </div>
                      <DialogTitle as="h3" className="text-lg font-bold font-heading text-dark dark:text-light">
                        Set Monthly Budget
                      </DialogTitle>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-1.5 rounded-xl text-dark/50 dark:text-light/50 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {error && (
                    <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl font-medium">
                      {error}
                    </div>
                  )}

                  {successMessage && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl font-medium">
                      {successMessage}
                    </div>
                  )}

                  <BudgetForm onSubmitBudget={handleSaveBudget} loading={loading} />

                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Footer />
    </div>
  );
}