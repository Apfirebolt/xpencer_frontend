"use client";

import { useState, useEffect, Fragment } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseCalendar from "@/components/ExpenseCalendar";
import ExpenseCardView from "@/components/ExpenseCard";
import ExpenseListView from "@/components/ExpenseList";
import ExpenseAgGrid from "@/components/ExpenseAgGrid";
import ExpenseChart from "@/components/ExpenseChart";
import MockExpenseModal from "@/components/MockExpenseModal";
import ConfirmModal from "@/components/ConfirmModal";
import { useExpenseStore } from "@/store/useExpenseStore";
import {
  WalletIcon,
  PlusCircleIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TableCellsIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function ExpenseClient() {
  const {
    expenses,
    fetching,
    loading,
    error,
    fetchExpenses,
    createExpense,
    deleteExpense,
    getTotalSpent,
  } = useExpenseStore();

  // Modals & View toggle state ('card' | 'list' | 'grid')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);
  
  // Confirmation Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDeleteId, setExpenseToDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [viewMode, setViewMode] = useState("card");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    fetchExpenses();
  }, [fetchExpenses]);

  async function handleCreateExpense(newExpenseData) {
    setSuccessMessage("");
    const result = await createExpense(newExpenseData);

    if (result.success) {
      setSuccessMessage("Expense successfully recorded!");
      setTimeout(() => {
        setSuccessMessage("");
        setIsFormModalOpen(false);
      }, 1500);
    }
  }

  // Prompt confirmation modal for deletion
  const promptDeleteExpense = (id) => {
    setExpenseToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Execute deletion upon confirmation
  const handleConfirmDelete = async () => {
    if (!expenseToDeleteId) return;
    setDeleting(true);

    try {
      await deleteExpense(expenseToDeleteId);
      setIsDeleteModalOpen(false);
      setExpenseToDeleteId(null);
    } catch (err) {
      console.error("Failed to delete expense:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light flex flex-col font-sans selection:bg-primary selection:text-white transition-colors duration-200">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-16 space-y-12">
        {/* Page Header & Actions */}
        <div
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-tertiary/20 pb-6"
          data-aos="fade-down"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase border border-primary/20 mb-3">
              <WalletIcon className="h-4 w-4" />
              <span>Expense Ledger</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              Manage Your Expenses
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Total Spent Quick Badge */}
            <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-tertiary/5 border border-tertiary/20 flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <CurrencyDollarIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-dark/50 dark:text-light/50 font-heading">
                  Total Tracked
                </p>
                <p className="text-sm font-extrabold font-heading text-primary">
                  ${getTotalSpent().toFixed(2)}
                </p>
              </div>
            </div>

            {/* Mock Data Generator Modal Button */}
            <button
              onClick={() => setIsMockModalOpen(true)}
              className="px-5 py-3.5 rounded-2xl font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all flex items-center gap-2 cursor-pointer shrink-0 text-xs"
            >
              <SparklesIcon className="h-4 w-4" />
              <span>Mock Data</span>
            </button>

            {/* Open Calendar Modal Button */}
            <button
              onClick={() => setIsCalendarModalOpen(true)}
              className="px-5 py-3.5 rounded-2xl font-bold bg-tertiary/20 hover:bg-tertiary/30 text-dark dark:text-light border border-tertiary/30 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <CalendarDaysIcon className="h-5 w-5 text-primary" />
              <span>Calendar</span>
            </button>

            {/* Toggle Analytics */}
            <button
              onClick={() => setIsAnalyticsOpen((prev) => !prev)}
              className="px-5 py-3.5 rounded-2xl font-bold bg-tertiary/20 hover:bg-tertiary/30 text-dark dark:text-light border border-tertiary/30 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <ChartBarIcon className="h-5 w-5 text-primary" />
              <span>Analytics</span>
            </button>

            {/* Add Expense Button */}
            <button
              onClick={() => setIsFormModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl font-bold bg-primary hover:bg-secondary text-white transition-all shadow-lg shadow-primary/25 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <PlusCircleIcon className="h-5 w-5" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Expense Charts Section (Rendered if expenses exist) */}
        {!fetching && isAnalyticsOpen && expenses.length > 0 && (
          <div className="grid grid-cols-1 gap-8" data-aos="fade-up">
            <ExpenseChart expenses={expenses} type="line" />
          </div>
        )}

        {/* Transactions Section Controls (View Mode Toggles) */}
        <div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4"
          data-aos="fade-up"
        >
          <h2 className="text-xl font-bold font-heading">
            Recent Transactions
          </h2>

          {/* Card, List & AG Grid View Toggle Switches */}
          <div className="flex items-center p-1.5 rounded-2xl bg-white dark:bg-tertiary/5 border border-tertiary/20 shadow-sm">
            <button
              onClick={() => setViewMode("card")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "card"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-dark/70 dark:text-light/70 hover:text-primary"
              }`}
            >
              <Squares2X2Icon className="h-4 w-4" />
              <span>Card View</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-dark/70 dark:text-light/70 hover:text-primary"
              }`}
            >
              <ListBulletIcon className="h-4 w-4" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-dark/70 dark:text-light/70 hover:text-primary"
              }`}
            >
              <TableCellsIcon className="h-4 w-4" />
              <span>Grid View</span>
            </button>
          </div>
        </div>

        {/* Transactions Display Area */}
        <div className="w-full" data-aos="fade-up" data-aos-delay="100">
          {fetching ? (
            <div className="p-12 text-center text-sm text-dark/50 dark:text-light/50 bg-white/50 dark:bg-dark/50 rounded-3xl border border-tertiary/20">
              Loading expenses...
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-16 text-center space-y-4 max-w-md mx-auto bg-white/50 dark:bg-dark/50 rounded-3xl border border-tertiary/20">
              <WalletIcon className="h-12 w-12 text-primary mx-auto opacity-50" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-dark dark:text-light">
                  No expenses logged yet
                </p>
                <p className="text-xs text-dark/60 dark:text-light/60">
                  Click the button above to add your first transaction.
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary transition-all border border-primary/20 cursor-pointer"
              >
                Add First Expense
              </button>
            </div>
          ) : (
            <>
              {viewMode === "card" && (
                <ExpenseCardView expenses={expenses} onDelete={promptDeleteExpense} />
              )}
              {viewMode === "list" && (
                <ExpenseListView expenses={expenses} onDelete={promptDeleteExpense} />
              )}
              {viewMode === "grid" && <ExpenseAgGrid expenses={expenses} />}
            </>
          )}
        </div>
      </main>

      {/* 1. Add Expense Form Modal */}
      <Transition appear show={isFormModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsFormModalOpen(false)}
        >
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
                      <DialogTitle
                        as="h3"
                        className="text-lg font-bold font-heading text-dark dark:text-light"
                      >
                        New Expense Entry
                      </DialogTitle>
                    </div>
                    <button
                      onClick={() => setIsFormModalOpen(false)}
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

                  <ExpenseForm
                    onSubmitExpense={handleCreateExpense}
                    loading={loading}
                  />
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* 2. Expense Calendar Modal */}
      <Transition appear show={isCalendarModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsCalendarModalOpen(false)}
        >
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
                      <DialogTitle
                        as="h3"
                        className="text-lg font-bold font-heading text-dark dark:text-light"
                      >
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

      {/* 3. Mock Data Generator Modal */}
      <MockExpenseModal
        isOpen={isMockModalOpen}
        onClose={() => setIsMockModalOpen(false)}
      />

      {/* 4. Confirmation Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
        confirmText="Yes, Delete"
        loading={deleting}
      />

      <Footer />
    </div>
  );
}