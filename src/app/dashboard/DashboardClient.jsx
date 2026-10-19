'use client';

import { useEffect, useState, Fragment } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseCalendar from '@/components/ExpenseCalendar';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useBudgetStore } from '@/store/useBudgetStore';
import { 
  WalletIcon, 
  ChartPieIcon, 
  PlusCircleIcon, 
  CurrencyDollarIcon, 
  CalendarDaysIcon, 
  ArrowRightIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function DashboardClient() {
  const { expenses, fetching: fetchingExpenses, fetchExpenses, createExpense, getTotalSpent } = useExpenseStore();
  const { budgets, fetchBudgets, getTotalBudgetLimit, getTotalBudgetSpent } = useBudgetStore();

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [expenseError, setExpenseError] = useState('');

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    fetchExpenses();
    fetchBudgets(currentMonth, currentYear);
  }, [fetchExpenses, fetchBudgets, currentMonth, currentYear]);

  async function handleCreateExpense(newExpenseData) {
    setExpenseError('');
    setSuccessMessage('');
    const result = await createExpense(newExpenseData);

    if (result.success) {
      setSuccessMessage('Expense successfully recorded!');
      fetchBudgets(currentMonth, currentYear); // Refresh budgets to reflect new spend
      setTimeout(() => {
        setSuccessMessage('');
        setIsExpenseModalOpen(false);
      }, 1500);
    } else {
      setExpenseError(result.error);
    }
  }

  const totalSpent = getTotalSpent();
  const totalBudgetLimit = getTotalBudgetLimit();
  const totalBudgetSpent = getTotalBudgetSpent();
  const budgetUsagePercent = totalBudgetLimit > 0 ? Math.min(Math.round((totalBudgetSpent / totalBudgetLimit) * 100), 100) : 0;

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light flex flex-col font-sans selection:bg-primary selection:text-white transition-colors duration-200">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-16 space-y-12">
        
        {/* Dashboard Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-tertiary/20 pb-6" data-aos="fade-down">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase border border-primary/20 mb-3">
              <WalletIcon className="h-4 w-4" />
              <span>Overview Suite</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              Financial Dashboard
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsCalendarModalOpen(true)}
              className="px-5 py-3 rounded-2xl font-bold bg-tertiary/20 hover:bg-tertiary/30 text-dark dark:text-light border border-tertiary/30 transition-all flex items-center gap-2 cursor-pointer text-xs"
            >
              <CalendarDaysIcon className="h-4 w-4 text-primary" />
              <span>Calendar View</span>
            </button>

            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-6 py-3 rounded-2xl font-bold bg-primary hover:bg-secondary text-white transition-all shadow-lg shadow-primary/25 flex items-center gap-2 cursor-pointer text-xs"
            >
              <PlusCircleIcon className="h-4 w-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" data-aos="fade-up">
          
          {/* Card 1: Total Lifetime/Loaded Spend */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-dark/80 border border-tertiary/20 dark:border-tertiary/10 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-dark/50 dark:text-light/50 font-heading">Total Expenses</span>
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <CurrencyDollarIcon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold font-heading text-primary">${totalSpent.toFixed(2)}</p>
            <p className="text-[11px] text-dark/60 dark:text-light/60">Across all recorded transactions</p>
          </div>

          {/* Card 2: Current Month Budget Limit */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-dark/80 border border-tertiary/20 dark:border-tertiary/10 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-dark/50 dark:text-light/50 font-heading">Monthly Budget</span>
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <ChartPieIcon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold font-heading text-dark dark:text-light">${totalBudgetLimit.toFixed(2)}</p>
            <p className="text-[11px] text-dark/60 dark:text-light/60">Allocated for this month</p>
          </div>

          {/* Card 3: Monthly Budget Usage */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-dark/80 border border-tertiary/20 dark:border-tertiary/10 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-dark/50 dark:text-light/50 font-heading">Budget Usage</span>
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <ReceiptPercentIcon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold font-heading text-primary">{budgetUsagePercent}%</p>
            <div className="w-full bg-tertiary/20 rounded-full h-2 overflow-hidden mt-2">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500" 
                style={{ width: `${budgetUsagePercent}%` }}
              />
            </div>
          </div>

        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" data-aos="fade-up" data-aos-delay="100">
          
          {/* Expenses Quick Link */}
          <div className="p-8 rounded-3xl bg-white/70 dark:bg-dark/70 border border-tertiary/20 dark:border-tertiary/10 flex flex-col justify-between space-y-6 shadow-sm hover:border-primary/50 transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <WalletIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading">Expense Ledger</h3>
              <p className="text-xs text-dark/70 dark:text-light/70 leading-relaxed font-sans">
                Review your recent transactions, toggle between card and list views, or log new daily purchases.
              </p>
            </div>
            <Link
              href="/expenses"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-secondary transition-colors group"
            >
              <span>Manage Expenses</span>
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Budgets Quick Link */}
          <div className="p-8 rounded-3xl bg-white/70 dark:bg-dark/70 border border-tertiary/20 dark:border-tertiary/10 flex flex-col justify-between space-y-6 shadow-sm hover:border-primary/50 transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <ChartPieIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading">Budget Planner</h3>
              <p className="text-xs text-dark/70 dark:text-light/70 leading-relaxed font-sans">
                Set category spending caps, check live progress meters, and avoid overspending before month-end.
              </p>
            </div>
            <Link
              href="/budgets"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-secondary transition-colors group"
            >
              <span>View Budgets</span>
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>

        {/* Recent Transactions Preview */}
        <div className="space-y-6" data-aos="fade-up" data-aos-delay="200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold font-heading">Recent Transactions</h2>
            <Link href="/expenses" className="text-xs font-bold text-primary hover:underline">
              View All
            </Link>
          </div>

          {fetchingExpenses ? (
            <div className="p-12 text-center text-sm text-dark/50 dark:text-light/50 bg-white/50 dark:bg-dark/50 rounded-3xl border border-tertiary/20">
              Loading recent transactions...
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-white/50 dark:bg-dark/50 rounded-3xl border border-tertiary/20">
              <WalletIcon className="h-10 w-10 text-primary mx-auto opacity-50" />
              <p className="text-sm font-semibold text-dark dark:text-light">No expenses recorded yet</p>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white"
              >
                Add Expense
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 5).map((exp) => (
                <div 
                  key={exp._id} 
                  className="p-5 rounded-2xl bg-white/80 dark:bg-dark/80 border border-tertiary/20 dark:border-tertiary/10 flex justify-between items-center shadow-sm"
                >
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                      {exp.type}
                    </span>
                    <p className="text-sm font-medium text-dark dark:text-light pt-1">
                      {exp.description || 'No description provided'}
                    </p>
                  </div>
                  <span className="text-lg font-extrabold font-heading text-primary">
                    ${Number(exp.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* 1. Add Expense Modal */}
      <Transition appear show={isExpenseModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsExpenseModalOpen(false)}>
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
                        <PlusCircleIcon className="h-5 w-5 text-primary" />
                      </div>
                      <DialogTitle as="h3" className="text-lg font-bold font-heading text-dark dark:text-light">
                        New Expense Entry
                      </DialogTitle>
                    </div>
                    <button
                      onClick={() => setIsExpenseModalOpen(false)}
                      className="p-1.5 rounded-xl text-dark/50 dark:text-light/50 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {expenseError && (
                    <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl font-medium">
                      {expenseError}
                    </div>
                  )}

                  {successMessage && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl font-medium">
                      {successMessage}
                    </div>
                  )}

                  <ExpenseForm onSubmitExpense={handleCreateExpense} />

                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* 2. Expense Calendar Modal */}
      <Transition appear show={isCalendarModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsCalendarModalOpen(false)}>
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
                <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white dark:bg-dark border border-tertiary/20 dark:border-tertiary/10 p-8 text-left align-middle shadow-2xl transition-all space-y-6">
                  
                  <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <CalendarDaysIcon className="h-5 w-5 text-primary" />
                      </div>
                      <DialogTitle as="h3" className="text-lg font-bold font-heading text-dark dark:text-light">
                        Monthly Expense Calendar
                      </DialogTitle>
                    </div>
                    <button
                      onClick={() => setIsCalendarModalOpen(false)}
                      className="p-1.5 rounded-xl text-dark/50 dark:text-light/50 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <ExpenseCalendar expenses={expenses} />

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