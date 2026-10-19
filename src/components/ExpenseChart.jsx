'use client';

import { useState, Fragment } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement, 
  RadialLinearScale,
  Title, 
  Tooltip, 
  Legend, 
  Filler,
  RadarController
} from 'chart.js';
import { Line, Doughnut, Bar, PolarArea, Pie, Radar } from 'react-chartjs-2';
import { EyeIcon, EyeSlashIcon, ChartBarIcon, ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';

// Register all required Chart.js modules
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement, 
  RadialLinearScale,
  Title, 
  Tooltip, 
  Legend, 
  Filler,
  RadarController
);

const CHART_COLORS = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b', 
  '#3b82f6', '#8b5cf6', '#14b8a6', '#f43f5e', '#64748b'
];

export default function ExpenseChart({ expenses = [] }) {
  // Track visibility state for each chart
  const [hiddenCharts, setHiddenCharts] = useState({});
  // Track active chart for full-screen modal view
  const [activeModalChart, setActiveModalChart] = useState(null);

  const toggleChart = (chartKey) => {
    setHiddenCharts(prev => ({ ...prev, [chartKey]: !prev[chartKey] }));
  };

  // --- Data Processing Helpers ---
  const dailySpending = {};
  const categorySpending = {};
  const modeSpending = {};
  const expenseTypeSpending = {};
  const amountDistribution = { '< $25': 0, '$25 - $100': 0, '> $100': 0 };

  expenses.forEach((exp) => {
    const amt = Number(exp.amount || 0);

    if (exp.createdAt) {
      const dateKey = new Date(exp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailySpending[dateKey] = (dailySpending[dateKey] || 0) + amt;
    }

    const cat = exp.category || exp.type || 'Other';
    categorySpending[cat] = (categorySpending[cat] || 0) + amt;

    const mode = exp.mode || 'Cash';
    modeSpending[mode] = (modeSpending[mode] || 0) + amt;

    const eType = exp.expenseType || 'Variable';
    expenseTypeSpending[eType] = (expenseTypeSpending[eType] || 0) + amt;

    if (amt < 25) amountDistribution['< $25'] += 1;
    else if (amt <= 100) amountDistribution['$25 - $100'] += 1;
    else amountDistribution['> $100'] += 1;
  });

  const categories = Object.keys(categorySpending);
  const categoryAmounts = Object.values(categorySpending);

  const modes = Object.keys(modeSpending);
  const modeAmounts = Object.values(modeSpending);

  const eTypes = Object.keys(expenseTypeSpending);
  const eTypeAmounts = Object.values(expenseTypeSpending);

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { family: 'sans-serif', size: 11 }, boxWidth: 12 },
      },
    },
  };

  const barOptions = {
    ...commonOptions,
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(150, 150, 150, 0.1)' } },
      x: { grid: { display: false } },
    },
  };

  const modalOptions = {
    ...barOptions,
    maintainAspectRatio: false,
    plugins: {
      ...barOptions.plugins,
      legend: {
        position: 'bottom',
        labels: { font: { family: 'sans-serif', size: 12 }, boxWidth: 14 },
      },
    }
  };

  // List of all 10 charts with data factory functions for modal rendering
  const chartsConfig = [
    {
      key: 'dailyTrend',
      title: '1. Daily Spending Trend',
      description: 'Outflow progression across days of the month',
      render: (isModal = false) => <Line data={{ labels: Object.keys(dailySpending), datasets: [{ label: 'Daily Spend ($)', data: Object.values(dailySpending), fill: true, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderColor: '#6366f1', borderWidth: 2, tension: 0.4 }] }} options={isModal ? modalOptions : barOptions} />
    },
    {
      key: 'categoryDoughnut',
      title: '2. Expense by Category (Doughnut)',
      description: 'Proportion of spending across categories',
      render: (isModal = false) => <Doughnut data={{ labels: categories, datasets: [{ data: categoryAmounts, backgroundColor: CHART_COLORS, borderWidth: 2, borderColor: '#ffffff' }] }} options={isModal ? modalOptions : commonOptions} />
    },
    {
      key: 'modeBar',
      title: '3. Expense by Payment Mode',
      description: 'Spending distribution across Cash, UPI, Cards, etc.',
      render: (isModal = false) => <Bar data={{ labels: modes, datasets: [{ label: 'Spend ($)', data: modeAmounts, backgroundColor: '#10b981', borderRadius: 8 }] }} options={isModal ? modalOptions : barOptions} />
    },
    {
      key: 'typePie',
      title: '4. Expense Type Breakdown',
      description: 'Fixed vs. Variable vs. Discretionary expenses',
      render: (isModal = false) => <Pie data={{ labels: eTypes, datasets: [{ data: eTypeAmounts, backgroundColor: ['#6366f1', '#f59e0b', '#ec4899'], borderWidth: 2, borderColor: '#ffffff' }] }} options={isModal ? modalOptions : commonOptions} />
    },
    {
      key: 'categoryPolar',
      title: '5. Category Polar Distribution',
      description: 'Multi-dimensional category magnitude view',
      render: (isModal = false) => <PolarArea data={{ labels: categories, datasets: [{ data: categoryAmounts, backgroundColor: CHART_COLORS.map(c => c + 'cc') }] }} options={isModal ? modalOptions : commonOptions} />
    },
    {
      key: 'modeDoughnut',
      title: '6. Payment Mode Share',
      description: 'Proportional usage of payment channels',
      render: (isModal = false) => <Doughnut data={{ labels: modes, datasets: [{ data: modeAmounts, backgroundColor: CHART_COLORS.slice(3) }] }} options={isModal ? modalOptions : commonOptions} />
    },
    {
      key: 'categoryBar',
      title: '7. Category Volume Comparison',
      description: 'Direct comparison of category spending limits',
      render: (isModal = false) => <Bar data={{ labels: categories, datasets: [{ label: 'Amount ($)', data: categoryAmounts, backgroundColor: '#8b5cf6', borderRadius: 8 }] }} options={isModal ? modalOptions : barOptions} />
    },
    {
      key: 'transactionSize',
      title: '8. Transaction Size Distribution',
      description: 'Frequency of small, medium, and large purchases',
      render: (isModal = false) => <Bar data={{ labels: Object.keys(amountDistribution), datasets: [{ label: 'Count', data: Object.values(amountDistribution), backgroundColor: '#f43f5e', borderRadius: 8 }] }} options={isModal ? modalOptions : barOptions} />
    },
    {
      key: 'typeBar',
      title: '9. Expense Type Comparison',
      description: 'Total capital allocation by financial nature',
      render: (isModal = false) => <Bar data={{ labels: eTypes, datasets: [{ label: 'Spend ($)', data: eTypeAmounts, backgroundColor: '#3b82f6', borderRadius: 8 }] }} options={isModal ? modalOptions : barOptions} />
    },
    {
      key: 'categoryRadar',
      title: '10. Category Radar Profile',
      description: 'Holistic behavioral profile across categories',
      render: (isModal = false) => <Radar data={{ labels: categories, datasets: [{ label: 'Category Outflow', data: categoryAmounts, backgroundColor: 'rgba(99, 102, 241, 0.2)', borderColor: '#6366f1', pointBackgroundColor: '#6366f1' }] }} options={isModal ? modalOptions : commonOptions} />
    },
  ];

  return (
    <div className="w-full space-y-8 font-sans">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <ChartBarIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading">Comprehensive Financial Analytics</h3>
            <p className="text-xs text-dark/60 dark:text-light/60">
              Displaying 10 visual insights covering category, mode, and spending trends
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Grid on Large Screens, 1 on Small */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {chartsConfig.map((chart) => {
          const isHidden = hiddenCharts[chart.key];

          return (
            <div 
              key={chart.key}
              className="bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between transition-all"
            >
              {/* Card Header with Show/Hide & Full Screen Buttons */}
              <div className="flex items-center justify-between border-b border-tertiary/20 pb-3">
                <div>
                  <h4 className="text-sm font-bold font-heading text-dark dark:text-light">
                    {chart.title}
                  </h4>
                  <p className="text-[11px] text-dark/50 dark:text-light/50">
                    {chart.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Full Screen Modal Button */}
                  <button
                    onClick={() => setActiveModalChart(chart)}
                    className="p-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all cursor-pointer"
                    title="Show Full Screen"
                  >
                    <ArrowsPointingOutIcon className="h-3.5 w-3.5" />
                  </button>

                  {/* Hide / Show Toggle Button */}
                  <button
                    onClick={() => toggleChart(chart.key)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-tertiary/20 hover:bg-tertiary/30 text-dark dark:text-light transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {isHidden ? (
                      <>
                        <EyeIcon className="h-3.5 w-3.5 text-primary" />
                        <span>Show</span>
                      </>
                    ) : (
                      <>
                        <EyeSlashIcon className="h-3.5 w-3.5 text-dark/50 dark:text-light/50" />
                        <span>Hide</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Chart Body Container (Collapsible) */}
              {!isHidden && (
                <div className="h-72 w-full pt-2 animate-fadeIn">
                  {chart.render(false)}
                </div>
              )}

              {isHidden && (
                <div className="h-24 w-full flex items-center justify-center text-xs text-dark/40 dark:text-light/40 italic bg-tertiary/5 rounded-2xl">
                  Chart hidden. Click 'Show' to view analytics.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Headless UI Large Modal for Full-Screen Chart View */}
      <Transition appear show={Boolean(activeModalChart)} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setActiveModalChart(null)}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-dark/70 backdrop-blur-sm" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-5xl transform overflow-hidden rounded-3xl bg-white dark:bg-dark border border-tertiary/20 dark:border-tertiary/10 p-8 text-left align-middle shadow-2xl transition-all space-y-6">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <ChartBarIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <DialogTitle as="h3" className="text-xl font-bold font-heading text-dark dark:text-light">
                          {activeModalChart?.title}
                        </DialogTitle>
                        <p className="text-xs text-dark/60 dark:text-light/60">
                          {activeModalChart?.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveModalChart(null)}
                      className="p-2 rounded-xl text-dark/50 dark:text-light/50 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Large Chart Container */}
                  <div className="h-[500px] w-full pt-4">
                    {activeModalChart?.render(true)}
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