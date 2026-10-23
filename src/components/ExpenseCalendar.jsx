'use client';

import { useState, Fragment } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CalendarDaysIcon, 
  ArrowPathIcon, 
  XMarkIcon, 
  CurrencyDollarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/context/LanguageContext';
import { currencies } from '@/utils/constants';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ExpenseCalendar({ expenses = [], recurringList = [], onSelectDate }) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showOnlyRecurring, setShowOnlyRecurring] = useState(false);

  // Modal State for Day Details Inspection
  const [selectedDayData, setSelectedDayData] = useState(null); // { dateStr, items, total }
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  // Extract user preferred currency symbol
  const userCurrencyCode = user?.settings?.currency || "USD";
  const currencyObj = currencies.find((c) => c.code === userCurrencyCode) || {
    symbol: "$",
    code: "USD",
  };
  const currencySymbol = currencyObj.symbol;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of the month and total days in the month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Navigation handlers
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Map expenses and recurring items to YYYY-MM-DD keys for fast lookup
  const expenseMap = {};

  // 1. Map standard expenses
  if (!showOnlyRecurring) {
    expenses.forEach((exp) => {
      if (!exp.createdAt) return;
      const dateStr = new Date(exp.createdAt).toISOString().split('T')[0];
      if (!expenseMap[dateStr]) {
        expenseMap[dateStr] = { total: 0, items: [] };
      }
      expenseMap[dateStr].total += Number(exp.amount || 0);
      expenseMap[dateStr].items.push(exp);
    });
  }

  // 2. Map recurring expenses based on their billingDay for the currently viewed month/year
  recurringList.forEach((rec) => {
    if (!rec.isActive || !rec.billingDay) return;
    
    const billingDayPadded = String(rec.billingDay).padStart(2, '0');
    const formattedMonth = String(month + 1).padStart(2, '0');
    const dateKey = `${year}-${formattedMonth}-${billingDayPadded}`;

    if (!expenseMap[dateKey]) {
      expenseMap[dateKey] = { total: 0, items: [] };
    }

    const isAlreadyMapped = expenseMap[dateKey].items.some(item => item._id === rec._id);
    if (!isAlreadyMapped) {
      expenseMap[dateKey].total += Number(rec.amount || 0);
      expenseMap[dateKey].items.push({
        ...rec,
        isRecurring: true,
      });
    }
  });

  // Handle cell click to open day inspection modal
  const handleCellClick = (dateKey, dayData) => {
    setSelectedDayData({ dateStr: dateKey, ...dayData });
    setIsDayModalOpen(true);
    if (onSelectDate) {
      onSelectDate(dateKey, dayData.items);
    }
  };

  // Build calendar grid cells
  const calendarCells = [];
  
  // Empty padding cells for previous month offset
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(
      <div 
        key={`empty-${i}`} 
        className="h-32 bg-tertiary/[0.02] dark:bg-tertiary/[0.01] rounded-2xl border border-dashed border-tertiary/10 opacity-30 hidden sm:block" 
      />
    );
  }

  // Active month days
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateKey = `${year}-${formattedMonth}-${formattedDay}`;
    
    const dayData = expenseMap[dateKey] || { total: 0, items: [] };
    const hasActivity = dayData.items.length > 0;
    const isToday = 
      day === new Date().getDate() && 
      month === new Date().getMonth() && 
      year === new Date().getFullYear();

    calendarCells.push(
      <div
        key={dateKey}
        onClick={() => hasActivity && handleCellClick(dateKey, dayData)}
        className={`h-32 p-3 rounded-2xl border transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
          isToday 
            ? 'border-primary bg-primary/[0.08] shadow-md ring-2 ring-primary/20' 
            : hasActivity 
              ? 'border-primary/40 bg-white dark:bg-dark/90 hover:border-primary hover:-translate-y-0.5 hover:shadow-xl shadow-sm cursor-pointer' 
              : 'border-tertiary/20 dark:border-tertiary/10 bg-white/50 dark:bg-dark/50 hover:border-tertiary/40'
        }`}
      >
        {/* Top: Date Number & Transaction Pill */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold font-mono w-7 h-7 flex items-center justify-center rounded-xl transition-all ${
            isToday 
              ? 'bg-primary text-white shadow-md shadow-primary/30 font-extrabold' 
              : hasActivity 
                ? 'bg-primary/10 text-primary font-bold' 
                : 'text-dark/50 dark:text-light/50 bg-tertiary/10'
          }`}>
            {day}
          </span>
          
          {hasActivity && (
            <span className="text-[10px] font-bold text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              {currencySymbol}{dayData.total.toFixed(0)}
            </span>
          )}
        </div>

        {/* Middle: Miniature Expense Previews (up to 2 items) */}
        {hasActivity ? (
          <div className="space-y-1 my-auto overflow-hidden">
            {dayData.items.slice(0, 2).map((item, idx) => (
              <div 
                key={item._id || idx} 
                className="text-[10px] bg-tertiary/10 dark:bg-tertiary/20 px-2 py-1 rounded-lg flex items-center justify-between gap-1 truncate font-sans"
              >
                <span className="truncate font-medium text-dark/80 dark:text-light/80 flex items-center gap-1">
                  {item.isRecurring && <ArrowPathIcon className="h-3 w-3 text-primary shrink-0" />}
                  {item.category || item.description || t('calendar.general') || 'Expense'}
                </span>
                <span className="font-mono text-primary font-bold shrink-0">
                  {currencySymbol}{Number(item.amount).toFixed(0)}
                </span>
              </div>
            ))}
            {dayData.items.length > 2 && (
              <p className="text-[9px] text-center font-mono text-dark/40 dark:text-light/40 font-bold">
                +{dayData.items.length - 2} {t('calendar.more') || 'more'}
              </p>
            )}
          </div>
        ) : (
          <div className="my-auto text-center text-[10px] text-dark/20 dark:text-light/20 italic font-sans select-none">
            {t('calendar.noActivity') || 'No activity'}
          </div>
        )}

        {/* Bottom Total Spent Indicator */}
        <div className="pt-1.5 border-t border-tertiary/10 flex items-center justify-between">
          <span className="text-[9px] uppercase font-bold text-dark/40 dark:text-light/40 font-heading tracking-wider">
            {t('calendar.total') || 'Total'}
          </span>
          <span className={`text-xs font-extrabold font-heading ${hasActivity ? 'text-primary' : 'text-dark/30 dark:text-light/30'}`}>
            {currencySymbol}{dayData.total.toFixed(2)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 rounded-3xl p-6 sm:p-8 shadow-sm font-sans backdrop-blur-xl">
      
      {/* Calendar Header / Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-tertiary/20 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
            <CalendarDaysIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-dark dark:text-light tracking-tight">
              {MONTH_NAMES[month]} <span className="text-primary font-normal">{year}</span>
            </h2>
            <p className="text-xs text-dark/50 dark:text-light/50 font-sans">
              {t('calendar.calendarSubtitle') || "Interactive financial timeline. Recurring bills are automatically pinned to their billing dates."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle Only Recurring Expenses */}
          <button
            onClick={() => setShowOnlyRecurring((prev) => !prev)}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-xs ${
              showOnlyRecurring 
                ? 'bg-primary text-white border-primary shadow-primary/20' 
                : 'bg-tertiary/10 hover:bg-tertiary/20 text-dark/70 dark:text-light/70 border-tertiary/20'
            }`}
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>
              {showOnlyRecurring 
                ? (t('calendar.showingOnlyRecurring') || "Showing Only Recurring") 
                : (t('calendar.showOnlyRecurring') || "Show Only Recurring")}
            </span>
          </button>

          <div className="flex items-center gap-1.5 bg-tertiary/5 p-1 rounded-2xl border border-tertiary/15">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl bg-tertiary/10 hover:bg-tertiary/20 text-dark dark:text-light transition-all cursor-pointer active:scale-95"
              aria-label="Previous Month"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary transition-all cursor-pointer active:scale-95"
            >
              {t('calendar.today') || "Today"}
            </button>

            <button
              onClick={nextMonth}
              className="p-2 rounded-xl bg-tertiary/10 hover:bg-tertiary/20 text-dark dark:text-light transition-all cursor-pointer active:scale-95"
              aria-label="Next Month"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-2 text-center py-2.5 bg-tertiary/5 rounded-2xl border border-tertiary/10">
        {DAY_NAMES.map((day) => (
          <span key={day} className="text-xs font-bold uppercase tracking-widest text-dark/50 dark:text-light/50 font-heading">
            {day}
          </span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2.5 sm:gap-3.5">
        {calendarCells}
      </div>

      {/* Day Details Inspection Modal */}
      <Transition appear show={isDayModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsDayModalOpen(false)}>
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
                <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-[2rem] bg-white dark:bg-dark border border-tertiary/20 dark:border-tertiary/10 p-8 text-left align-middle shadow-2xl transition-all space-y-6">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                        <CalendarDaysIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <DialogTitle as="h3" className="text-base font-extrabold font-heading text-dark dark:text-light">
                          Activity for {selectedDayData?.dateStr}
                        </DialogTitle>
                        <p className="text-xs text-dark/50 dark:text-light/50 font-mono font-bold">
                          Total Spent: <span className="text-primary">{currencySymbol}{selectedDayData?.total.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsDayModalOpen(false)}
                      className="p-1.5 rounded-xl text-dark/50 dark:text-light/50 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {selectedDayData?.items.map((item, idx) => (
                      <div 
                        key={item._id || idx}
                        className="p-4 rounded-2xl bg-tertiary/5 dark:bg-tertiary/10 border border-tertiary/15 flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {item.isRecurring ? (
                              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold font-mono border border-primary/20 flex items-center gap-1">
                                <ArrowPathIcon className="h-3 w-3" />
                                Recurring
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-tertiary/20 text-dark/70 dark:text-light/70 text-[10px] font-bold font-mono">
                                {item.mode || 'Cash'}
                              </span>
                            )}
                            <span className="text-xs font-bold text-dark/50 dark:text-light/50">
                              {item.category || 'General'}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-dark dark:text-light">
                            {item.description || 'No description provided'}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-base font-extrabold font-heading text-primary">
                            {currencySymbol}{Number(item.amount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="pt-2 border-t border-tertiary/20 flex justify-end">
                    <button
                      onClick={() => setIsDayModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-secondary transition-all shadow-md shadow-primary/20 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

    </div>
  );
}