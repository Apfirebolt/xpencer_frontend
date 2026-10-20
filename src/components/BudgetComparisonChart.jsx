'use client';

import { useMemo } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ScaleIcon } from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
);

export default function BudgetComparisonChart({ comparisonData }) {
  if (!comparisonData) return null;

  const { month1, month2 } = comparisonData;

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const label1 = `${monthNames[month1.month - 1]} ${month1.year}`;
  const label2 = `${monthNames[month2.month - 1]} ${month2.year}`;

  // Calculate totals
  const m1Limit = month1.budgets.reduce((acc, b) => acc + Number(b.limit || 0), 0);
  const m1Spent = month1.budgets.reduce((acc, b) => acc + Number(b.spent || 0), 0);
  
  const m2Limit = month2.budgets.reduce((acc, b) => acc + Number(b.limit || 0), 0);
  const m2Spent = month2.budgets.reduce((acc, b) => acc + Number(b.spent || 0), 0);

  // 1. Overall Comparison Bar Chart Data
  const overallData = {
    labels: [label1, label2],
    datasets: [
      {
        label: 'Total Budgeted ($)',
        data: [m1Limit, m2Limit],
        backgroundColor: '#6366f1',
        borderRadius: 8,
      },
      {
        label: 'Total Spent ($)',
        data: [m1Spent, m2Spent],
        backgroundColor: '#ec4899',
        borderRadius: 8,
      },
    ],
  };

  // 2. Category-Level Variance Chart Data
  // Merge categories from both months
  const allCategories = Array.from(new Set([
    ...month1.budgets.map(b => b.category),
    ...month2.budgets.map(b => b.category)
  ]));

  const catSpent1 = allCategories.map(cat => {
    const found = month1.budgets.find(b => b.category === cat);
    return Number(found?.spent || 0);
  });

  const catSpent2 = allCategories.map(cat => {
    const found = month2.budgets.find(b => b.category === cat);
    return Number(found?.spent || 0);
  });

  const categoryData = {
    labels: allCategories,
    datasets: [
      {
        label: label1,
        data: catSpent1,
        backgroundColor: '#6366f1',
        borderRadius: 6,
      },
      {
        label: label2,
        data: catSpent2,
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { family: 'sans-serif', size: 11 }, boxWidth: 12 },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(150, 150, 150, 0.1)' } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="w-full space-y-6 pt-4 font-sans">
      <div className="flex items-center gap-2 border-b border-tertiary/20 pb-3">
        <ScaleIcon className="h-5 w-5 text-primary" />
        <h4 className="text-base font-bold font-heading">Visual Monthly Comparison</h4>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Spend vs Budget Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 space-y-4 shadow-sm">
          <div>
            <h5 className="text-sm font-bold font-heading">Budget vs. Actual Outflow</h5>
            <p className="text-[11px] text-dark/60 dark:text-light/60">Macro comparison of total targets and spending</p>
          </div>
          <div className="h-64 w-full">
            <Bar data={overallData} options={commonOptions} />
          </div>
        </div>

        {/* Category Breakdown Comparison Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 space-y-4 shadow-sm">
          <div>
            <h5 className="text-sm font-bold font-heading">Category Spend Breakdown</h5>
            <p className="text-[11px] text-dark/60 dark:text-light/60">Side-by-side category expenditure comparison</p>
          </div>
          <div className="h-64 w-full">
            <Bar data={categoryData} options={commonOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}