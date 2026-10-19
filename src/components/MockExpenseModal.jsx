'use client';

import { useState, Fragment } from 'react';
import { useExpenseStore } from '@/store/useExpenseStore';
import { SparklesIcon, TrashIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';

export default function MockExpenseModal({ isOpen, onClose }) {
  const { generateMockExpenses, clearMockExpenses, loading, error } = useExpenseStore();
  
  const [count, setCount] = useState('10');
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  async function handleGenerate(e) {
    e.preventDefault();
    setFeedbackMessage('');
    const result = await generateMockExpenses(Number(count), Number(month), Number(year));
    
    if (result.success) {
      setFeedbackMessage(`Successfully generated ${count} test expenses!`);
      setTimeout(() => {
        setFeedbackMessage('');
        onClose();
      }, 1500);
    }
  }

  async function handleClear() {
    if (confirm("Are you sure you want to delete all auto-generated test expenses?")) {
      setFeedbackMessage('');
      const result = await clearMockExpenses();
      if (result.success) {
        setFeedbackMessage('All test expenses cleared successfully!');
        setTimeout(() => {
          setFeedbackMessage('');
          onClose();
        }, 1500);
      }
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-dark border border-tertiary/20 dark:border-tertiary/10 p-8 text-left align-middle shadow-2xl transition-all space-y-6 font-sans">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <SparklesIcon className="h-5 w-5 text-primary" />
                    </div>
                    <DialogTitle as="h3" className="text-lg font-bold font-heading text-dark dark:text-light">
                      Mock Data Generator
                    </DialogTitle>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-xl text-dark/50 dark:text-light/50 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Description Notice */}
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-xs text-dark/70 dark:text-light/70 leading-relaxed">
                  You can instantly populate mock expense data for any given month to test your charts, AG Grid, and calendar views. All generated items are flagged so you can safely clear them whenever you are ready to add real data.
                </div>

                {/* Feedback Alerts */}
                {error && (
                  <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl font-medium">
                    {error}
                  </div>
                )}

                {feedbackMessage && (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl font-medium">
                    {feedbackMessage}
                  </div>
                )}

                {/* Generator Form */}
                <form onSubmit={handleGenerate} className="space-y-4">
                  
                  {/* Number of Entries Dropdown */}
                  <div className="space-y-1.5">
                    <label htmlFor="count" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
                      Number of Entries
                    </label>
                    <select
                      id="count"
                      value={count}
                      onChange={(e) => setCount(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary text-dark dark:text-light shadow-inner cursor-pointer"
                    >
                      <option value="10">10 Random Entries</option>
                      <option value="20">20 Random Entries</option>
                      <option value="30">30 Random Entries</option>
                      <option value="40">40 Random Entries</option>
                    </select>
                  </div>

                  {/* Month & Year Selectors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="mockMonth" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
                        Month
                      </label>
                      <select
                        id="mockMonth"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary text-dark dark:text-light shadow-inner cursor-pointer"
                      >
                        {MONTH_NAMES.map((m, idx) => (
                          <option key={m} value={idx + 1}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="mockYear" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
                        Year
                      </label>
                      <input
                        id="mockYear"
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary text-dark dark:text-light shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 space-y-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer"
                    >
                      <SparklesIcon className="h-4 w-4" />
                      <span>{loading ? "Generating..." : "Generate Test Data"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClear}
                      disabled={loading}
                      className="w-full py-3 text-sm font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span>Clear Test Data</span>
                    </button>
                  </div>

                </form>

              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}