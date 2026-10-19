'use client';

import { useState, useEffect, Fragment } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ExpenseForm from '@/components/ExpenseForm';
import httpClient from '@/lib/api';
import { WalletIcon, PlusCircleIcon, CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function ExpenseClient() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    try {
      setFetching(true);
      const res = await httpClient.get('/expenses');
      const data = res.data.expenses || res.data;
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
      setExpenses([]);
    } finally {
      setFetching(false);
    }
  }

  async function handleCreateExpense(newExpenseData) {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await httpClient.post('/expenses', newExpenseData);
      const createdExpense = res.data.expense || res.data;
      
      setExpenses([createdExpense, ...expenses]);
      setSuccessMessage('Expense successfully recorded!');
      
      // Close modal on success after a short delay
      setTimeout(() => {
        setSuccessMessage('');
        setIsModalOpen(false);
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to save expense.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light flex flex-col font-sans selection:bg-primary selection:text-white transition-colors duration-200">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-16 space-y-12">
        
        {/* Page Header & Trigger Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-tertiary/20 pb-6" data-aos="fade-down">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase border border-primary/20 mb-3">
              <WalletIcon className="h-4 w-4" />
              <span>Expense Ledger</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              Manage Your Expenses
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <p className="hidden sm:block text-xs text-dark/60 dark:text-light/60 font-sans max-w-xs text-right">
              Log daily transactions and monitor your spending categories.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl font-bold bg-primary hover:bg-secondary text-white transition-all shadow-lg shadow-primary/25 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <PlusCircleIcon className="h-5 w-5" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Expenses List Section */}
        <div className="space-y-6 max-w-3xl mx-auto w-full" data-aos="fade-up">
          <h2 className="text-xl font-bold font-heading">Recent Transactions</h2>

          {fetching ? (
            <div className="p-12 text-center text-sm text-dark/50 dark:text-light/50 bg-white/50 dark:bg-dark/50 rounded-3xl border border-tertiary/20">
              Loading expenses...
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-16 text-center space-y-4 bg-white/50 dark:bg-dark/50 rounded-3xl border border-tertiary/20">
              <WalletIcon className="h-12 w-12 text-primary mx-auto opacity-50" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-dark dark:text-light">No expenses logged yet</p>
                <p className="text-xs text-dark/60 dark:text-light/60">Click the button above to add your first transaction.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary transition-all border border-primary/20 cursor-pointer"
              >
                Add First Expense
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((exp) => (
                <div 
                  key={exp._id || Math.random()} 
                  className="p-6 rounded-2xl bg-white/80 dark:bg-dark/80 border border-tertiary/20 dark:border-tertiary/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:border-primary/40 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                        {exp.type}
                      </span>
                      <span className="text-xs text-dark/40 dark:text-light/40 flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-dark dark:text-light pt-1">
                      {exp.description || 'No description provided'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-extrabold font-heading text-primary">
                      ${Number(exp.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Headless UI Modal for Expense Form */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
          {/* Backdrop */}
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
                  
                  {/* Modal Header */}
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
                      onClick={() => setIsModalOpen(false)}
                      className="p-1.5 rounded-xl text-dark/50 dark:text-light/50 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Feedback Alerts */}
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

                  {/* Expense Form Component */}
                  <ExpenseForm onSubmitExpense={handleCreateExpense} loading={loading} />

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