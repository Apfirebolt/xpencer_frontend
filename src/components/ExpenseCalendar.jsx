'use client';

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ExpenseCalendar({ expenses = [], onSelectDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());

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

  // Map expenses to YYYY-MM-DD keys for fast lookup
  const expenseMap = {};
  expenses.forEach((exp) => {
    if (!exp.createdAt) return;
    const dateStr = new Date(exp.createdAt).toISOString().split('T')[0];
    if (!expenseMap[dateStr]) {
      expenseMap[dateStr] = { total: 0, items: [] };
    }
    expenseMap[dateStr].total += Number(exp.amount || 0);
    expenseMap[dateStr].items.push(exp);
  });

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
        onClick={() => hasActivity && onSelectDate && onSelectDate(dateKey, dayData.items)}
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
              ${dayData.total.toFixed(0)}
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
                <span className="truncate font-medium text-dark/80 dark:text-light/80">
                  {item.category || item.description || 'Expense'}
                </span>
                <span className="font-mono text-primary font-bold shrink-0">
                  ${Number(item.amount).toFixed(0)}
                </span>
              </div>
            ))}
            {dayData.items.length > 2 && (
              <p className="text-[9px] text-center font-mono text-dark/40 dark:text-light/40 font-bold">
                +{dayData.items.length - 2} more
              </p>
            )}
          </div>
        ) : (
          <div className="my-auto text-center text-[10px] text-dark/20 dark:text-light/20 italic font-sans select-none">
            No activity
          </div>
        )}

        {/* Bottom Total Spent Indicator */}
        <div className="pt-1.5 border-t border-tertiary/10 flex items-center justify-between">
          <span className="text-[9px] uppercase font-bold text-dark/40 dark:text-light/40 font-heading tracking-wider">Total</span>
          <span className={`text-xs font-extrabold font-heading ${hasActivity ? 'text-primary' : 'text-dark/30 dark:text-light/30'}`}>
            ${dayData.total.toFixed(2)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 rounded-3xl p-6 sm:p-8 shadow-sm font-sans backdrop-blur-xl">
      
      {/* Calendar Header / Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-tertiary/20 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
            <CalendarDaysIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-dark dark:text-light tracking-tight">
              {MONTH_NAMES[month]} <span className="text-primary font-normal">{year}</span>
            </h2>
            <p className="text-xs text-dark/50 dark:text-light/50 font-sans">
              Interactive financial activity overview. Click any active date to inspect items.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2.5 rounded-2xl bg-tertiary/10 hover:bg-tertiary/20 text-dark dark:text-light border border-tertiary/20 transition-all cursor-pointer active:scale-95"
            aria-label="Previous Month"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            Today
          </button>

          <button
            onClick={nextMonth}
            className="p-2.5 rounded-2xl bg-tertiary/10 hover:bg-tertiary/20 text-dark dark:text-light border border-tertiary/20 transition-all cursor-pointer active:scale-95"
            aria-label="Next Month"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
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

    </div>
  );
}