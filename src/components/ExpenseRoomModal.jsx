'use client';

import { useState, Fragment } from 'react';
import { useExpenseRoomStore } from '@/store/useRoomStore';
import { UserGroupIcon, DocumentTextIcon, XMarkIcon, ArrowRightIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';

export default function ExpenseRoomModal({ isOpen, onClose }) {
  const { createRoom, loading, error } = useExpenseRoomStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [allowMembersToAddExpense, setAllowMembersToAddExpense] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    setSuccessMessage('');
    const result = await createRoom({
      title: title.trim(),
      description: description.trim(),
      allowMembersToAddExpense
    });

    if (result.success) {
      setSuccessMessage('Expense room successfully created!');
      setTitle('');
      setDescription('');
      setAllowMembersToAddExpense(true);

      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    }
  };

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
                      <UserGroupIcon className="h-5 w-5 text-primary" />
                    </div>
                    <DialogTitle as="h3" className="text-lg font-bold font-heading text-dark dark:text-light">
                      Create Expense Room
                    </DialogTitle>
                  </div>
                  <button
                    onClick={onClose}
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Title Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="title" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
                      Room Title *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark/30 dark:text-light/30">
                        <UserGroupIcon className="h-4 w-4" />
                      </span>
                      <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary text-dark dark:text-light placeholder-dark/30 dark:placeholder-light/30 shadow-inner"
                        placeholder="Goa Trip 2026"
                        required
                      />
                    </div>
                  </div>

                  {/* Description Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="description" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
                      Description *
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
                        placeholder="Shared accommodation and travel expenses..."
                        required
                      />
                    </div>
                  </div>

                  {/* Configurable Permission Checkbox */}
                  <div className="flex items-center gap-3 pt-2 p-3.5 rounded-2xl bg-tertiary/5 border border-tertiary/20">
                    <input
                      id="allowMembers"
                      type="checkbox"
                      checked={allowMembersToAddExpense}
                      onChange={(e) => setAllowMembersToAddExpense(e.target.checked)}
                      className="w-4 h-4 text-primary bg-white dark:bg-dark border-tertiary/30 rounded focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="allowMembers" className="text-xs font-medium text-dark dark:text-light cursor-pointer select-none">
                      Allow other members to add expenses to this room
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer mt-4"
                  >
                    <span>{loading ? "Creating Room..." : "Create Expense Room"}</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>

                </form>

              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}