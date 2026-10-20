'use client';

import { Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone. Are you sure you want to proceed?",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false 
}) {
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
                
                {/* Header with Warning Icon */}
                <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-600 dark:text-rose-400">
                      <ExclamationTriangleIcon className="h-5 w-5" />
                    </div>
                    <DialogTitle as="h3" className="text-lg font-bold font-heading text-dark dark:text-light">
                      {title}
                    </DialogTitle>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-xl text-dark/50 dark:text-light/50 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Message Body */}
                <p className="text-xs text-dark/70 dark:text-light/70 leading-relaxed">
                  {message}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 py-3 text-xs font-bold rounded-xl bg-tertiary/20 hover:bg-tertiary/30 text-dark dark:text-light transition-all cursor-pointer border border-tertiary/30"
                  >
                    {cancelText}
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex-1 py-3 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Processing..." : confirmText}
                  </button>
                </div>

              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}