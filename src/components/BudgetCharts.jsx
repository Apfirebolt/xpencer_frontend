'use client';

import { useTranslation } from '@/context/LanguageContext';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ChartBarIcon } from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

const CHART_COLORS = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b', 
  '#3b82f6', '#8b5cf6', '#14b8a6', '#f43f5e', '#64748b'
];

export default function BudgetChart({ budgets = [], budgetModes = [], currencySymbol = '$' }) {
  const { t } = useTranslation();

  if ((!budgets || budgets.length === 0) && (!budgetModes || budgetModes.length === 0)) {
    return null;
  }

  // 1. Category Budget vs Spent Data
  const catLabels = budgets.map(b => b.category);
  const catLimits = budgets.map(b => Number(b.limit || 0));
  const catSpent = budgets.map(b => Number(b.spent || 0));

  const categoryBarData = {
    labels: catLabels,
    datasets: [
      {
        label: t("budgetChart.limitLabel") || `Limit (${currencySymbol})`,
        data: catLimits,
        backgroundColor: '#6366f1',
        borderRadius: 6,
      },
      {
        label: t("budgetChart.spentLabel") || `Spent (${currencySymbol})`,
        data: catSpent,
        backgroundColor: '#ec4899',
        borderRadius: 6,
      },
    ],
  };

  // 2. Payment Mode Spending Share Data
  const modeLabels = budgetModes.map(bm => bm.paymentMode);
  const modeSpent = budgetModes.map(bm => Number(bm.spent || 0));

  const modeDoughnutData = {
    labels: modeLabels,
    datasets: [
      {
        data: modeSpent,
        backgroundColor: CHART_COLORS,
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const barOptions = {
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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { family: 'sans-serif', size: 11 }, boxWidth: 12 },
      },
    },
  };

  return (
    <div className="w-full space-y-6 pt-4 font-sans" data-aos="fade-up">
      <div className="flex items-center gap-2 border-b border-tertiary/20 pb-3">
        <ChartBarIcon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold font-heading">
          {t("budgetChart.sectionTitle") || "Visual Budget & Limit Analytics"}
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Budget vs Spent Bar Chart */}
        {budgets.length > 0 && (
          <div className="p-7 rounded-[2rem] bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 space-y-4 shadow-sm">
            <div>
              <h4 className="text-sm font-bold font-heading">
                {t("budgetChart.categoryBarTitle") || "Category Budget vs. Actual Spent"}
              </h4>
              <p className="text-xs text-dark/60 dark:text-light/60">
                {t("budgetChart.categoryBarDesc") || "Direct comparison of allocated limits against money spent"}
              </p>
            </div>
            <div className="h-72 w-full pt-2">
              <Bar data={categoryBarData} options={barOptions} />
            </div>
          </div>
        )}

        {/* Payment Mode Share Doughnut Chart */}
        {budgetModes.length > 0 && (
          <div className="p-7 rounded-[2rem] bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 space-y-4 shadow-sm">
            <div>
              <h4 className="text-sm font-bold font-heading">
                {t("budgetChart.modeDoughnutTitle") || "Payment Mode Outflow Distribution"}
              </h4>
              <p className="text-xs text-dark/60 dark:text-light/60">
                {t("budgetChart.modeDoughnutDesc") || "Proportional breakdown of spending across payment channels"}
              </p>
            </div>
            <div className="h-72 w-full pt-2">
              <Doughnut data={modeDoughnutData} options={doughnutOptions} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}