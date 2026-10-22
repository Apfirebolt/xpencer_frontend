'use client';

import { useState, Fragment } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/context/LanguageContext';
import { currencies } from '@/utils/constants';
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
import { EyeIcon, EyeSlashIcon, ChartBarIcon, ArrowsPointingOutIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import jsPDF from 'jspdf';

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
  const { user } = useAuthStore();
  const { t } = useTranslation();

  // Extract user preferred currency symbol
  const userCurrencyCode = user?.settings?.currency || 'USD';
  const currencyObj = currencies.find((c) => c.code === userCurrencyCode) || { symbol: '$', code: 'USD' };
  const currencySymbol = currencyObj.symbol;

  const [hiddenCharts, setHiddenCharts] = useState({});
  const [activeModalChart, setActiveModalChart] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const toggleChart = (chartKey) => {
    setHiddenCharts(prev => ({ ...prev, [chartKey]: !prev[chartKey] }));
  };

  // --- Export All Charts to PDF Function ---
  const exportChartsPDF = async () => {
    setExportingPdf(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const canvasElements = document.querySelectorAll('canvas');

      if (!canvasElements || canvasElements.length === 0) {
        alert(t("charts.noChartsAlert") || "No visible charts found to export.");
        setExportingPdf(false);
        return;
      }

      // Title Page / Header Banner
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(99, 102, 241);
      doc.text("Financial Analytics & Insights Report", 14, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`${t("charts.pdfGeneratedOn") || "Generated on"}: ${new Date().toLocaleDateString()}`, 14, 28);
      doc.text(`${t("charts.pdfDenomination") || "Denomination"}: ${currencySymbol} (${userCurrencyCode})`, 14, 34);

      let yOffset = 45;
      let pageHeight = doc.internal.pageSize.height;

      canvasElements.forEach((canvas) => {
        if (!canvas || canvas.width === 0 || canvas.height === 0) return;

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 180; // Fit within A4 width with margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if we need a new page
        if (yOffset + imgHeight > pageHeight - 20) {
          doc.addPage();
          yOffset = 20;
        }

        doc.addImage(imgData, 'PNG', 15, yOffset, imgWidth, imgHeight);
        yOffset += imgHeight + 15;
      });

      doc.save(`financial-analytics-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("Failed to export charts PDF:", err);
    } finally {
      setExportingPdf(false);
    }
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

  // Distinct chart configurations with translation keys
  const chartsConfig = [
    {
      key: 'dailyTrend',
      title: t("charts.dailyTrendTitle") || '1. Daily Spending Trend',
      description: t("charts.dailyTrendDesc") || 'Outflow progression across days of the month',
      render: (isModal = false) => (
        <Line 
          key={`line-${isModal}`}
          data={{
            labels: Object.keys(dailySpending),
            datasets: [{
              label: `${t("charts.dailySpendLabel") || 'Daily Spend'} (${currencySymbol})`,
              data: Object.values(dailySpending),
              fill: true,
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              borderColor: '#6366f1',
              borderWidth: 2.5,
              tension: 0.4
            }]
          }} 
          options={isModal ? modalOptions : barOptions} 
        />
      )
    },
    {
      key: 'categoryDoughnut',
      title: t("charts.categoryDoughnutTitle") || '2. Expense by Category (Doughnut)',
      description: t("charts.categoryDoughnutDesc") || 'Proportion of spending across categories',
      render: (isModal = false) => (
        <Doughnut 
          key={`doughnut-cat-${isModal}`}
          data={{
            labels: categories,
            datasets: [{
              data: categoryAmounts,
              backgroundColor: CHART_COLORS,
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          }} 
          options={isModal ? modalOptions : commonOptions} 
        />
      )
    },
    {
      key: 'modeBar',
      title: t("charts.modeBarTitle") || '3. Expense by Payment Mode',
      description: t("charts.modeBarDesc") || 'Spending distribution across Cash, UPI, Cards, etc.',
      render: (isModal = false) => (
        <Bar 
          key={`bar-mode-${isModal}`}
          data={{
            labels: modes,
            datasets: [{
              label: `${t("charts.spendLabel") || 'Spend'} (${currencySymbol})`,
              data: modeAmounts,
              backgroundColor: '#10b981',
              borderRadius: 8
            }]
          }} 
          options={isModal ? modalOptions : barOptions} 
        />
      )
    },
    {
      key: 'typePie',
      title: t("charts.typePieTitle") || '4. Expense Type Breakdown',
      description: t("charts.typePieDesc") || 'Fixed vs. Variable vs. Discretionary expenses',
      render: (isModal = false) => (
        <Pie 
          key={`pie-type-${isModal}`}
          data={{
            labels: eTypes,
            datasets: [{
              data: eTypeAmounts,
              backgroundColor: ['#6366f1', '#f59e0b', '#ec4899'],
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          }} 
          options={isModal ? modalOptions : commonOptions} 
        />
      )
    },
    {
      key: 'categoryPolar',
      title: t("charts.categoryPolarTitle") || '5. Category Polar Distribution',
      description: t("charts.categoryPolarDesc") || 'Multi-dimensional category magnitude view',
      render: (isModal = false) => (
        <PolarArea 
          key={`polar-cat-${isModal}`}
          data={{
            labels: categories,
            datasets: [{
              data: categoryAmounts,
              backgroundColor: CHART_COLORS.map(c => c + 'cc')
            }]
          }} 
          options={isModal ? modalOptions : commonOptions} 
        />
      )
    },
    {
      key: 'modeDoughnut',
      title: t("charts.modeDoughnutTitle") || '6. Payment Mode Share',
      description: t("charts.modeDoughnutDesc") || 'Proportional usage of payment channels',
      render: (isModal = false) => (
        <Doughnut 
          key={`doughnut-mode-${isModal}`}
          data={{
            labels: modes,
            datasets: [{
              data: modeAmounts,
              backgroundColor: CHART_COLORS.slice(3)
            }]
          }} 
          options={isModal ? modalOptions : commonOptions} 
        />
      )
    },
    {
      key: 'categoryBar',
      title: t("charts.categoryBarTitle") || '7. Category Volume Comparison',
      description: t("charts.categoryBarDesc") || 'Direct comparison of category spending limits',
      render: (isModal = false) => (
        <Bar 
          key={`bar-cat-${isModal}`}
          data={{
            labels: categories,
            datasets: [{
              label: `${t("charts.amountLabel") || 'Amount'} (${currencySymbol})`,
              data: categoryAmounts,
              backgroundColor: '#8b5cf6',
              borderRadius: 8
            }]
          }} 
          options={isModal ? modalOptions : barOptions} 
        />
      )
    },
    {
      key: 'transactionSize',
      title: t("charts.transactionSizeTitle") || '8. Transaction Size Distribution',
      description: t("charts.transactionSizeDesc") || 'Frequency of small, medium, and large purchases',
      render: (isModal = false) => (
        <Bar 
          key={`bar-size-${isModal}`}
          data={{
            labels: Object.keys(amountDistribution),
            datasets: [{
              label: t("charts.countLabel") || 'Count',
              data: Object.values(amountDistribution),
              backgroundColor: '#f43f5e',
              borderRadius: 8
            }]
          }} 
          options={isModal ? modalOptions : barOptions} 
        />
      )
    },
    {
      key: 'typeBar',
      title: t("charts.typeBarTitle") || '9. Expense Type Comparison',
      description: t("charts.typeBarDesc") || 'Total capital allocation by financial nature',
      render: (isModal = false) => (
        <Bar 
          key={`bar-type-${isModal}`}
          data={{
            labels: eTypes,
            datasets: [{
              label: `${t("charts.spendLabel") || 'Spend'} (${currencySymbol})`,
              data: eTypeAmounts,
              backgroundColor: '#3b82f6',
              borderRadius: 8
            }]
          }} 
          options={isModal ? modalOptions : barOptions} 
        />
      )
    },
    {
      key: 'categoryRadar',
      title: t("charts.categoryRadarTitle") || '10. Category Radar Profile',
      description: t("charts.categoryRadarDesc") || 'Holistic behavioral profile across categories',
      render: (isModal = false) => (
        <Radar 
          key={`radar-cat-${isModal}`}
          data={{
            labels: categories,
            datasets: [{
              label: t("charts.categoryOutflowLabel") || 'Category Outflow',
              data: categoryAmounts,
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              borderColor: '#6366f1',
              pointBackgroundColor: '#6366f1'
            }]
          }} 
          options={isModal ? modalOptions : commonOptions} 
        />
      )
    },
  ];

  return (
    <div className="w-full space-y-8 font-sans">
      
      {/* Section Header with Export PDF Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 p-7 rounded-[2rem] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-xs">
            <ChartBarIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading">{t("charts.suiteTitle") || "Comprehensive Financial Suite"}</h3>
            <p className="text-xs text-dark/60 dark:text-light/60">
              {t("charts.suiteDesc") || "Displaying 10 visual insights covering category, mode, and spending trends"} ({currencySymbol} {t("charts.denominated") || "denominated"})
            </p>
          </div>
        </div>

        <button
          onClick={exportChartsPDF}
          disabled={exportingPdf || expenses.length === 0}
          className="px-5 py-3 rounded-2xl font-bold bg-primary hover:bg-secondary text-white transition-all shadow-lg shadow-primary/25 flex items-center gap-2 cursor-pointer text-xs disabled:opacity-50 shrink-0"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          <span>{exportingPdf ? (t("charts.generatingPdf") || "Generating PDF...") : (t("charts.exportPdf") || "Export Analytics PDF")}</span>
        </button>
      </div>

      {/* 2-Column Grid on Large Screens, 1 on Small */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {chartsConfig.map((chart) => {
          const isHidden = hiddenCharts[chart.key];

          return (
            <div 
              key={chart.key}
              className="bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 rounded-[2rem] p-7 shadow-sm space-y-5 flex flex-col justify-between hover:shadow-xl transition-all group"
            >
              {/* Card Header with Show/Hide & Full Screen Buttons */}
              <div className="flex items-center justify-between border-b border-tertiary/15 pb-4">
                <div>
                  <h4 className="text-base font-bold font-heading text-dark dark:text-light">
                    {chart.title}
                  </h4>
                  <p className="text-xs text-dark/50 dark:text-light/50 pt-0.5">
                    {chart.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveModalChart(chart)}
                    className="p-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all cursor-pointer shadow-xs"
                    title={t("charts.showFullScreen") || "Show Full Screen"}
                  >
                    <ArrowsPointingOutIcon className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => toggleChart(chart.key)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-tertiary/20 hover:bg-tertiary/30 text-dark dark:text-light transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isHidden ? (
                      <>
                        <EyeIcon className="h-4 w-4 text-primary" />
                        <span>{t("charts.showBtn") || "Show"}</span>
                      </>
                    ) : (
                      <>
                        <EyeSlashIcon className="h-4 w-4 text-dark/50 dark:text-light/50" />
                        <span>{t("charts.hideBtn") || "Hide"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {!isHidden && (
                <div className="h-80 w-full pt-2 animate-fadeIn">
                  {chart.render(false)}
                </div>
              )}

              {isHidden && (
                <div className="h-28 w-full flex items-center justify-center text-xs text-dark/40 dark:text-light/40 italic bg-tertiary/10 rounded-2xl border border-tertiary/15">
                  {t("charts.hiddenMessage") || "Chart hidden. Click 'Show' to view analytics."}
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
                <DialogPanel className="w-full max-w-5xl transform overflow-hidden rounded-[2rem] bg-white dark:bg-dark border border-tertiary/20 p-8 text-left align-middle shadow-2xl transition-all space-y-6">
                  
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