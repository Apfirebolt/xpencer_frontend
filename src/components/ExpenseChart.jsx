'use client';

import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
);

export default function ExpenseChart({ expenses = [], type = 'line' }) {
  // 1. Process data for Line Chart (Spending over days of the month)
  const dailySpending = {};
  // 2. Process data for Doughnut Chart (Spending breakdown by category)
  const categorySpending = {};

  expenses.forEach((exp) => {
    if (!exp.createdAt) return;
    
    // Format Date for Line Chart (e.g., "Aug 12")
    const dateObj = new Date(exp.createdAt);
    const dateKey = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    dailySpending[dateKey] = (dailySpending[dateKey] || 0) + Number(exp.amount || 0);

    // Group by Category for Doughnut Chart
    const cat = exp.type || 'Other';
    categorySpending[cat] = (categorySpending[cat] || 0) + Number(exp.amount || 0);
  });

  // Line Chart Data
  const lineData = {
    labels: Object.keys(dailySpending),
    datasets: [
      {
        label: 'Daily Spend ($)',
        data: Object.values(dailySpending),
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)', // Primary theme color with opacity
        borderColor: '#6366f1', // Primary theme color
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointRadius: 4,
      },
    ],
  };

  // Doughnut Chart Data
  const doughnutData = {
    labels: Object.keys(categorySpending),
    datasets: [
      {
        data: Object.values(categorySpending),
        backgroundColor: [
          '#6366f1', // Primary
          '#ec4899', // Pink / Accent
          '#10b981', // Emerald / Success
          '#f59e0b', // Amber / Warning
          '#3b82f6', // Blue
          '#8b5cf6', // Purple
          '#14b8a6', // Teal
          '#64748b', // Slate
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'sans-serif', size: 11 },
          boxWidth: 12,
        },
      },
    },
  };

  const lineOptions = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(150, 150, 150, 0.1)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="w-full bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 rounded-3xl p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold font-heading">
          {type === 'line' ? 'Monthly Spending Trend' : 'Category Breakdown'}
        </h3>
        <p className="text-xs text-dark/60 dark:text-light/60 font-sans">
          {type === 'line' ? 'Visualizing outflow across days of the month' : 'Proportion of expenses by category type'}
        </p>
      </div>

      <div className="h-72 w-full">
        {type === 'line' ? (
          <Line data={lineData} options={lineOptions} />
        ) : (
          <Doughnut data={doughnutData} options={commonOptions} />
        )}
      </div>
    </div>
  );
}