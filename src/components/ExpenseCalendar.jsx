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
    calendarCells.push(<div key={`empty-${i}`} className="h-28 bg-white/30 dark:bg-dark/30 rounded-2xl border border-transparent opacity-30" />);
  }

  // Active month days
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateKey = `${year}-${formattedMonth}-${formattedDay}`;
    
    const dayData = expenseMap[dateKey] || { total: 0, items: [] };
    const isToday = 
      day === new Date().getDate() && 
      month === new Date().getMonth() && 
      year === new Date().getFullYear();

    calendarCells.push(
      <div
        key={dateKey}
        onClick={() => dayData.items.length > 0 && onSelectDate && onSelectDate(dateKey, dayData.items)}
        className={`h-28 p-2.5 rounded-2xl border transition-all flex flex-col justify-between group ${
          isToday 
            ? 'border-primary bg-primary/5 shadow-sm' 
            : 'border-tertiary/20 dark:border-tertiary/10 bg-white/60 dark:bg-dark/60 hover:border-primary/50'
        } ${dayData.items.length > 0 ? 'cursor-pointer hover:shadow-md' : ''}`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg ${
            isToday ? 'bg-primary text-white' : 'text-dark/70 dark:text-light/70 bg-tertiary/10'
          }`}>
            {day}
          </span>
          {dayData.items.length > 0 && (
            <span className="text-[10px] font-bold text-primary font-mono">
              {dayData.items.length} txns
            </span>
          )}
        </div>

        {dayData.total > 0 ? (
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-dark/40 dark:text-light/40 font-heading">Spent</p>
            <p className="text-sm font-extrabold font-heading text-primary truncate">
              ${dayData.total.toFixed(2)}
            </p>
          </div>
        ) : (
          <div className="text-[10px] text-dark/20 dark:text-light/20 font-sans italic">
            No activity
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 rounded-3xl p-6 sm:p-8 shadow-sm font-sans">
      
      {/* Calendar Header / Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-tertiary/20 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <CalendarDaysIcon className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold font-heading text-dark dark:text-light">
            {MONTH_NAMES[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2.5 rounded-xl bg-tertiary/20 hover:bg-tertiary/30 text-dark dark:text-light border border-tertiary/30 transition-all cursor-pointer"
            aria-label="Previous Month"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2.5 rounded-xl bg-tertiary/20 hover:bg-tertiary/30 text-dark dark:text-light border border-tertiary/30 transition-all cursor-pointer"
            aria-label="Next Month"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {DAY_NAMES.map((day) => (
          <span key={day} className="text-xs font-bold uppercase tracking-wider text-dark/50 dark:text-light/50 font-heading">
            {day}
          </span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarCells}
      </div>

    </div>
  );
}