'use client';

import { useEffect, useState, Fragment } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseCalendar from '@/components/ExpenseCalendar';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useRecurringStore } from '@/store/useRecurringExpenseStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/context/LanguageContext';
import { currencies } from '@/utils/constants';
import { 
  WalletIcon, 
  ChartPieIcon, 
  PlusCircleIcon, 
  CurrencyDollarIcon, 
  CalendarDaysIcon, 
  ArrowRightIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ReceiptPercentIcon,
  UserCircleIcon,
  SparklesIcon,
  TrendingUpIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function DashboardClient() {
  const { expenses, fetching: fetchingExpenses, fetchExpenses, createExpense, getTotalSpent } = useExpenseStore();
  const { budgets, fetchBudgets, getTotalBudgetLimit, getTotalBudgetSpent } = useBudgetStore();
  const { user, initializeAuth } = useAuthStore();
  const { recurringList, fetchRecurring } = useRecurringStore();
  const { t } = useTranslation();

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [expenseError, setExpenseError] = useState('');

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    initializeAuth();
    fetchExpenses();
    fetchBudgets(currentMonth, currentYear);
    fetchRecurring();
  }, [fetchExpenses, fetchBudgets, initializeAuth, fetchRecurring, currentMonth, currentYear]);

  // Extract user preferred currency symbol
  const userCurrencyCode = user?.settings?.currency || 'USD';
  const currencyObj = currencies.find((c) => c.code === userCurrencyCode) || { symbol: '$', code: 'USD' };
  const currencySymbol = currencyObj.symbol;

  async function handleCreateExpense(newExpenseData) {
    setExpenseError('');
    setSuccessMessage('');
    const result = await createExpense(newExpenseData);

    if (result.success) {
      setSuccessMessage(t('dashboard.successExpenseRecorded') || 'Expense successfully recorded!');
      fetchBudgets(currentMonth, currentYear);
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
  const remainingBudget = totalBudgetLimit - totalBudgetSpent;

  // Resolve user display name or fallback to email
  const displayName = user 
    ? (user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.email)
    : 'Guest';

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light flex flex-col font-sans selection:bg-primary selection:text-white transition-colors duration-200">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-16 space-y-12">
        
        {/* Professional Dashboard Welcome Header with Greeting */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-tertiary/20 pb-6" data-aos="fade-down">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase border border-primary/20 shadow-xs">
              <SparklesIcon className="h-4 w-4" />
              <span>{t('dashboard.badge') || "Overview Suite"}</span>
            </div>
            {/* Greeting Header */}
            <h1 
              className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading flex items-center gap-2"
              
            >
              Hello, <span className="text-primary">{displayName}</span> 👋
            </h1>
            <p className="text-xs text-dark/60 dark:text-light/60 font-sans">
              {t('dashboard.welcomeMessage') || "This is your monthly financial overview."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsCalendarModalOpen(true)}
              className="px-5 py-3.5 rounded-2xl font-bold bg-tertiary/20 hover:bg-tertiary/30 text-dark dark:text-light border border-tertiary/30 transition-all flex items-center gap-2 cursor-pointer text-xs shadow-sm"
            >
              <CalendarDaysIcon className="h-4 w-4 text-primary" />
              <span>{t('dashboard.calendarView') || "Calendar View"}</span>
            </button>

            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl font-bold bg-primary hover:bg-secondary text-white transition-all shadow-lg shadow-primary/25 flex items-center gap-2 cursor-pointer text-xs"
            >
              <PlusCircleIcon className="h-5 w-5" />
              <span>{t('dashboard.addExpense') || "Add Expense"}</span>
            </button>
          </div>
        </div>

        {/* Detailed Analytics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-aos="fade-up">
          
          {/* Card 1: Total Lifetime Spend */}
          <div className="p-7 rounded-[2rem] bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 space-y-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-dark/50 dark:text-light/50 font-heading">{t('dashboard.totalExpenses') || "Total Expenses"}</span>
              <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-xs">
                <CurrencyDollarIcon className="h-5 w-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold font-heading text-primary">{currencySymbol}{totalSpent.toFixed(2)}</p>
              <p className="text-[11px] text-dark/60 dark:text-light/60 pt-1">{t('dashboard.acrossAllTransactions') || "Across all recorded transactions"}</p>
            </div>
          </div>

          {/* Card 2: Current Month Budget Limit */}
          <div className="p-7 rounded-[2rem] bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 space-y-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-secondary/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-dark/50 dark:text-light/50 font-heading">{t('dashboard.monthlyBudget') || "Monthly Budget"}</span>
              <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-xs">
                <ChartPieIcon className="h-5 w-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold font-heading text-dark dark:text-light">{currencySymbol}{totalBudgetLimit.toFixed(2)}</p>
              <p className="text-[11px] text-dark/60 dark:text-light/60 pt-1">{t('dashboard.allocatedForMonth') || "Allocated for this month"}</p>
            </div>
          </div>

          {/* Card 3: Remaining Budget */}
          <div className="p-7 rounded-[2rem] bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 space-y-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-dark/50 dark:text-light/50 font-heading">Remaining Budget</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20 shadow-xs">
                <WalletIcon className="h-5 w-5" />
              </div>
            </div>
            <div>
              <p className={`text-3xl font-extrabold font-heading ${remainingBudget < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                {currencySymbol}{remainingBudget.toFixed(2)}
              </p>
              <p className="text-[11px] text-dark/60 dark:text-light/60 pt-1">Available to spend this month</p>
            </div>
          </div>

          {/* Card 4: Monthly Budget Usage Meter */}
          <div className="p-7 rounded-[2rem] bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 space-y-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-dark/50 dark:text-light/50 font-heading">{t('dashboard.budgetUsage') || "Budget Usage"}</span>
              <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-xs">
                <ReceiptPercentIcon className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center">
                <p className="text-3xl font-extrabold font-heading text-primary">{budgetUsagePercent}%</p>
                <span className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full ${
                  budgetUsagePercent > 90 ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'
                }`}>
                  {budgetUsagePercent > 90 ? 'Near Limit' : 'On Track'}
                </span>
              </div>
              <div className="w-full bg-tertiary/20 rounded-full h-2.5 overflow-hidden mt-3 shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${budgetUsagePercent > 90 ? 'bg-rose-500' : 'bg-primary'}`} 
                  style={{ width: `${budgetUsagePercent}%` }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" data-aos="fade-up" data-aos-delay="100">
          
          {/* Expenses Quick Link */}
          <div className="p-8 rounded-[2rem] bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-2xl hover:border-primary/50 transition-all group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-105 transition-transform shadow-xs">
                <WalletIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading">{t('dashboard.expenseLedgerTitle') || "Expense Ledger"}</h3>
              <p className="text-xs text-dark/70 dark:text-light/70 leading-relaxed font-sans">
                {t('dashboard.expenseLedgerDesc') || "Review your recent transactions, toggle between card and list views, or log new daily purchases."}
              </p>
            </div>
            <Link
              href="/expenses"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-secondary transition-colors group"
            >
              <span>{t('dashboard.manageExpenses') || "Manage Expenses"}</span>
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Budgets Quick Link */}
          <div className="p-8 rounded-[2rem] bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-2xl hover:border-primary/50 transition-all group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-105 transition-transform shadow-xs">
                <ChartPieIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading">{t('dashboard.budgetPlannerTitle') || "Budget Planner"}</h3>
              <p className="text-xs text-dark/70 dark:text-light/70 leading-relaxed font-sans">
                {t('dashboard.budgetPlannerDesc') || "Set category spending caps, check live progress meters, and avoid overspending before month-end."}
              </p>
            </div>
            <Link
              href="/budgets"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-secondary transition-colors group"
            >
              <span>{t('dashboard.viewBudgets') || "View Budgets"}</span>
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>

        {/* Recent Transactions Preview Section */}
        <div className="space-y-6" data-aos="fade-up" data-aos-delay="200">
          <div className="flex justify-between items-center border-b border-tertiary/20 pb-4">
            <div>
              <h2 className="text-xl font-bold font-heading">{t('dashboard.recentTransactions') || "Recent Transactions"}</h2>
              <p className="text-xs text-dark/50 dark:text-light/50">Latest recorded purchases across your ledger</p>
            </div>
            <Link href="/expenses" className="px-4 py-2 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all shadow-xs">
              {t('dashboard.viewAll') || "View All"}
            </Link>
          </div>

          {fetchingExpenses ? (
            <div className="p-12 text-center text-sm text-dark/50 dark:text-light/50 bg-white/50 dark:bg-dark/50 rounded-3xl border border-tertiary/20">
              {t('dashboard.loadingTransactions') || "Loading recent transactions..."}
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-16 text-center space-y-4 bg-white/50 dark:bg-dark/50 rounded-[2rem] border border-tertiary/20 max-w-md mx-auto shadow-sm">
              <WalletIcon className="h-12 w-12 text-primary mx-auto opacity-50" />
              <p className="text-sm font-semibold text-dark dark:text-light">{t('dashboard.noExpenses') || "No expenses recorded yet"}</p>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-white shadow-md shadow-primary/20"
              >
                {t('dashboard.addExpense') || "Add Expense"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 5).map((exp) => (
                <div 
                  key={exp._id} 
                  className="p-5 rounded-2xl bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 flex justify-between items-center shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary font-bold font-mono flex items-center justify-center border border-primary/20 text-xs shadow-xs">
                      {currencySymbol}{Number(exp.amount).toFixed(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold font-mono">
                          {exp.category || exp.type || "General"}
                        </span>
                        {exp.isSplit && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[9px] font-bold font-mono">
                            Split
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-dark dark:text-light">
                        {exp.description || t('dashboard.noDescription') || 'No description provided'}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-extrabold font-heading text-primary">
                    {currencySymbol}{Number(exp.amount).toFixed(2)}
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
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-[2rem] bg-white dark:bg-dark border border-tertiary/20 dark:border-tertiary/10 p-8 text-left align-middle shadow-2xl transition-all space-y-6">
                  
                  <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <PlusCircleIcon className="h-5 w-5 text-primary" />
                      </div>
                      <DialogTitle as="h3" className="text-lg font-bold font-heading text-dark dark:text-light">
                        {t('dashboard.modalTitle') || "New Expense Entry"}
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
                <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-[2rem] bg-white dark:bg-dark border border-tertiary/20 dark:border-tertiary/10 p-8 text-left align-middle shadow-2xl transition-all space-y-6">
                  
                  <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <CalendarDaysIcon className="h-5 w-5 text-primary" />
                      </div>
                      <DialogTitle as="h3" className="text-lg font-bold font-heading text-dark dark:text-light">
                        {t('dashboard.calendarModalTitle') || "Monthly Expense Calendar"}
                      </DialogTitle>
                    </div>
                    <button
                      onClick={() => setIsCalendarModalOpen(false)}
                      className="p-1.5 rounded-xl text-dark/50 dark:text-light/50 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <ExpenseCalendar expenses={expenses} recurringList={recurringList} />

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