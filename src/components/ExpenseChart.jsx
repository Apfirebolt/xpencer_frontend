'use client';

import { useState } from 'react';
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
import { EyeIcon, EyeSlashIcon, ChartBarIcon } from '@heroicons/react/24/outline';

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
  // Track visibility state for each of the 10 charts
  const [hiddenCharts, setHiddenCharts] = useState({});

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

    // 1. Daily Spending
    if (exp.createdAt) {
      const dateKey = new Date(exp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailySpending[dateKey] = (dailySpending[dateKey] || 0) + amt;
    }

    // 2. Category Breakdown
    const cat = exp.category || exp.type || 'Other';
    categorySpending[cat] = (categorySpending[cat] || 0) + amt;

    // 3. Mode of Expense (Cash, UPI, Credit Card, etc.)
    const mode = exp.mode || 'Cash';
    modeSpending[mode] = (modeSpending[mode] || 0) + amt;

    // 4. Expense Type (Fixed, Variable, Discretionary)
    const eType = exp.expenseType || 'Variable';
    expenseTypeSpending[eType] = (expenseTypeSpending[eType] || 0) + amt;

    // 5. Amount Ranges
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

  // Common options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { family: 'sans-serif', size: 10 }, boxWidth: 10 },
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

  // List of all 10 charts
  const chartsConfig = [
    {
      key: 'dailyTrend',
      title: '1. Daily Spending Trend',
      description: 'Outflow progression across days of the month',
      component: <Line data={{ labels: Object.keys(dailySpending), datasets: [{ label: 'Daily Spend ($)', data: Object.values(dailySpending), fill: true, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderColor: '#6366f1', borderWidth: 2, tension: 0.4 }] }} options={barOptions} />
    },
    {
      key: 'categoryDoughnut',
      title: '2. Expense by Category (Doughnut)',
      description: 'Proportion of spending across categories',
      component: <Doughnut data={{ labels: categories, datasets: [{ data: categoryAmounts, backgroundColor: CHART_COLORS, borderWidth: 2, borderColor: '#ffffff' }] }} options={commonOptions} />
    },
    {
      key: 'modeBar',
      title: '3. Expense by Payment Mode',
      description: 'Spending distribution across Cash, UPI, Cards, etc.',
      component: <Bar data={{ labels: modes, datasets: [{ label: 'Spend ($)', data: modeAmounts, backgroundColor: '#10b981', borderRadius: 8 }] }} options={barOptions} />
    },
    {
      key: 'typePie',
      title: '4. Expense Type Breakdown',
      description: 'Fixed vs. Variable vs. Discretionary expenses',
      component: <Pie data={{ labels: eTypes, datasets: [{ data: eTypeAmounts, backgroundColor: ['#6366f1', '#f59e0b', '#ec4899'], borderWidth: 2, borderColor: '#ffffff' }] }} options={commonOptions} />
    },
    {
      key: 'categoryPolar',
      title: '5. Category Polar Distribution',
      description: 'Multi-dimensional category magnitude view',
      component: <PolarArea data={{ labels: categories, datasets: [{ data: categoryAmounts, backgroundColor: CHART_COLORS.map(c => c + 'cc') }] }} options={commonOptions} />
    },
    {
      key: 'modeDoughnut',
      title: '6. Payment Mode Share',
      description: 'Proportional usage of payment channels',
      component: <Doughnut data={{ labels: modes, datasets: [{ data: modeAmounts, backgroundColor: CHART_COLORS.slice(3) }] }} options={commonOptions} />
    },
    {
      key: 'categoryBar',
      title: '7. Category Volume Comparison',
      description: 'Direct comparison of category spending limits',
      component: <Bar data={{ labels: categories, datasets: [{ label: 'Amount ($)', data: categoryAmounts, backgroundColor: '#8b5cf6', borderRadius: 8 }] }} options={barOptions} />
    },
    {
      key: 'transactionSize',
      title: '8. Transaction Size Distribution',
      description: 'Frequency of small, medium, and large purchases',
      component: <Bar data={{ labels: Object.keys(amountDistribution), datasets: [{ label: 'Count', data: Object.values(amountDistribution), backgroundColor: '#f43f5e', borderRadius: 8 }] }} options={barOptions} />
    },
    {
      key: 'typeBar',
      title: '9. Expense Type Comparison',
      description: 'Total capital allocation by financial nature',
      component: <Bar data={{ labels: eTypes, datasets: [{ label: 'Spend ($)', data: eTypeAmounts, backgroundColor: '#3b82f6', borderRadius: 8 }] }} options={barOptions} />
    },
    {
      key: 'categoryRadar',
      title: '10. Category Radar Profile',
      description: 'Holistic behavioral profile across categories',
      component: <Radar data={{ labels: categories, datasets: [{ label: 'Category Outflow', data: categoryAmounts, backgroundColor: 'rgba(99, 102, 241, 0.2)', borderColor: '#6366f1', pointBackgroundColor: '#6366f1' }] }} options={commonOptions} />
    },
  ];

  return (
    <div className="w-full space-y-8">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <ChartBarIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading">Comprehensive Financial Analytics</h3>
            <p className="text-xs text-dark/60 dark:text-light/60 font-sans">
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
              {/* Card Header with Show/Hide Button */}
              <div className="flex items-center justify-between border-b border-tertiary/20 pb-3">
                <div>
                  <h4 className="text-sm font-bold font-heading text-dark dark:text-light">
                    {chart.title}
                  </h4>
                  <p className="text-[11px] text-dark/50 dark:text-light/50 font-sans">
                    {chart.description}
                  </p>
                </div>

                <button
                  onClick={() => toggleChart(chart.key)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-tertiary/20 hover:bg-tertiary/30 text-dark dark:text-light transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  aria-label={`Toggle ${chart.title}`}
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

              {/* Chart Body Container (Collapsible) */}
              {!isHidden && (
                <div className="h-72 w-full pt-2 animate-fadeIn">
                  {chart.component}
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

    </div>
  );
}