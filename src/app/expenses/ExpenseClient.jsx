"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExpenseForm from "@/components/ExpenseForm";
import RecurringExpenseForm from "@/components/RecurringExpenseForm";
import ExpenseCalendar from "@/components/ExpenseCalendar";
import ExpenseCardView from "@/components/ExpenseCard";
import ExpenseListView from "@/components/ExpenseList";
import ExpenseAgGrid from "@/components/ExpenseAgGrid";
import ExpenseChart from "@/components/ExpenseChart";
import MockExpenseModal from "@/components/MockExpenseModal";
import ConfirmModal from "@/components/ConfirmModal";
import { useExpenseStore } from "@/store/useExpenseStore";
import { useRecurringStore } from "@/store/useRecurringExpenseStore";
import { useAuthStore } from "@/store/useAuthStore";
import { currencies } from "@/utils/constants";
import {
  WalletIcon,
  PlusCircleIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TableCellsIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon,
  UserIcon,
  ArrowPathIcon,
  TrashIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useTranslation } from "@/context/LanguageContext";
import AOS from "aos";
import "aos/dist/aos.css";

export default function ExpenseClient() {
  const { t } = useTranslation();
  const { user, initializeAuth } = useAuthStore();
  const {
    expenses,
    fetching,
    loading,
    error,
    fetchExpenses,
    createExpense,
    deleteExpense,
    markSplitPaymentPaid,
    getTotalSpent,
  } = useExpenseStore();

  const {
    recurringList,
    fetchRecurring,
    createRecurring,
    deleteRecurring,
    loading: recurringLoading,
    fetching: recurringFetching,
  } = useRecurringStore();

  // Modals & View toggle state ('card' | 'list' | 'grid' | 'recurring')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);

  // Confirmation Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDeleteId, setExpenseToDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Search Query & Filter Type State ("all" | "personal" | "split" | "recurring")
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [viewMode, setViewMode] = useState("card");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch both standard expenses and recurring commitments on mount
  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    initializeAuth();
    fetchExpenses();
    fetchRecurring();
  }, [fetchExpenses, fetchRecurring, initializeAuth]);

  // Extract user preferred currency symbol
  const userCurrencyCode = user?.settings?.currency || "USD";
  const currencyObj = currencies.find((c) => c.code === userCurrencyCode) || {
    symbol: "$",
    code: "USD",
  };
  const currencySymbol = currencyObj.symbol;

  async function handleCreateExpense(newExpenseData) {
    setSuccessMessage("");
    const result = await createExpense(newExpenseData);

    if (result.success) {
      setSuccessMessage(
        t("expenses.successExpenseRecorded") ||
          "Expense successfully recorded!",
      );
      setTimeout(() => {
        setSuccessMessage("");
        setIsFormModalOpen(false);
      }, 1500);
    }
  }

  // Handle batch creation of recurring expenses
  const handleBatchRecurringSubmit = async (batchPayload) => {
    setSuccessMessage("");
    let allSuccess = true;

    for (const item of batchPayload) {
      const res = await createRecurring(item);
      if (!res.success) {
        allSuccess = false;
        break;
      }
    }

    if (allSuccess) {
      setSuccessMessage("Recurring commitments successfully created!");
      setTimeout(() => {
        setSuccessMessage("");
        setIsRecurringModalOpen(false);
        fetchExpenses(); // Refresh to catch auto-generated ones
        fetchRecurring();
      }, 1500);
    }
  };

  // Prompt confirmation modal for deletion
  const promptDeleteExpense = (id) => {
    setDeleteError("");
    setExpenseToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Execute deletion upon confirmation
  const handleConfirmDelete = async () => {
    if (!expenseToDeleteId) return;
    setDeleting(true);
    setDeleteError("");

    try {
      const result = await deleteExpense(expenseToDeleteId);
      if (result && !result.success) {
        setDeleteError(result.error);
        setIsDeleteModalOpen(false);
        setExpenseToDeleteId(null);
      } else {
        setIsDeleteModalOpen(false);
        setExpenseToDeleteId(null);
      }
    } catch (err) {
      console.error("Failed to delete expense:", err);
      setDeleteError("Failed to delete expense.");
    } finally {
      setDeleting(false);
    }
  };

  const exportExpensesPDF = () => {
    const doc = new jsPDF();

    // Get user currency symbol dynamically
    const userCurrencyCode = user?.settings?.currency || "USD";
    const currencySymbol =
      currencies.find((c) => c.code === userCurrencyCode)?.symbol || "$";

    // Title & Metadata
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Expense Ledger Report", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(
      `Total Tracked: ${currencySymbol}${getTotalSpent().toFixed(2)}`,
      14,
      34,
    );

    // Table Data Mapping
    const tableColumn = [
      "Date",
      "Category",
      "Mode",
      "Description",
      `Amount (${currencySymbol})`,
    ];
    const tableRows = filteredExpenses.map((exp) => [
      exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : "N/A",
      exp.category || "General",
      exp.mode || "Cash",
      exp.description || "No description",
      `${currencySymbol}${Number(exp.amount).toFixed(2)}`,
    ]);

    // Generate Table using autotable plugin
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 42,
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241] }, // matches your primary color theme
      styles: { fontSize: 9, cellPadding: 4 },
    });

    // Save the PDF
    doc.save(`expense-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Client-side fuzzy search and split/recurring filtering logic
  const filteredExpenses = useMemo(() => {
    let result = expenses;

    // 1. Filter by Type (All / Personal / Split Shares)
    if (filterType === "personal") {
      result = result.filter((exp) => !exp.isSplit);
    } else if (filterType === "split") {
      result = result.filter((exp) => exp.isSplit);
    }

    // 2. Filter by Search Query Tokens
    if (!searchQuery.trim()) return result;

    const queryTokens = searchQuery.toLowerCase().trim().split(/\s+/);

    return result.filter((exp) => {
      const categoryText = (exp.category || "").toLowerCase();
      const descriptionText = (exp.description || "").toLowerCase();
      const roomTitle = (exp.roomId?.title || "").toLowerCase();
      const combinedText = `${categoryText} ${descriptionText} ${roomTitle}`;

      return queryTokens.every((token) => combinedText.includes(token));
    });
  }, [expenses, searchQuery, filterType]);

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light flex flex-col font-sans selection:bg-primary selection:text-white transition-colors duration-200">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-16 space-y-10">
        {/* Page Header & Actions */}
        <div
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-tertiary/20 pb-6"
          data-aos="fade-down"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase border border-primary/20 shadow-xs">
              <WalletIcon className="h-4 w-4" />
              <span>Expense Ledger Suite</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              {t("expenses.title") || "Manage Your Expenses"}
            </h1>
            {/* Redesigned Total Tracked Premium Widget */}
            <div className="p-2 rounded-[1.5rem] bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 flex items-center gap-3.5 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-xs">
                <CurrencyDollarIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold tracking-wider text-dark/50 dark:text-light/50 font-heading">
                  {t("expenses.totalTracked") || "Total Tracked"}
                </p>
                <p className="text-base font-extrabold font-heading text-primary">
                  {currencySymbol}
                  {getTotalSpent().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Recurring Expenses Button */}
            <button
              onClick={() => setIsRecurringModalOpen(true)}
              className="px-1 py-1.5 rounded-2xl font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all flex items-center gap-2 cursor-pointer shrink-0 text-xs shadow-xs"
              title="Add Recurring Expenses"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span className="hidden sm:inline">
                Recurring ({recurringList.length})
              </span>
            </button>

            {/* Mock Data Generator Modal Button */}
            <button
              onClick={() => setIsMockModalOpen(true)}
              className="px-1.5 py-2 rounded-2xl font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all flex items-center gap-2 cursor-pointer shrink-0 text-xs shadow-xs"
              title="Generate Mock Data"
            >
              <SparklesIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Mock Data</span>
            </button>

            {/* Open Calendar Modal Button */}
            <button
              onClick={() => setIsCalendarModalOpen(true)}
              className="px-2.5 py-3 rounded-2xl font-bold bg-tertiary/20 hover:bg-tertiary/30 text-dark dark:text-light border border-tertiary/30 transition-all flex items-center gap-2 cursor-pointer shrink-0 text-xs shadow-xs"
            >
              <CalendarDaysIcon className="h-4 w-4 text-primary" />
              <span>Calendar</span>
            </button>

            {/* Toggle Analytics */}
            <button
              onClick={() => setIsAnalyticsOpen((prev) => !prev)}
              className="px-3 py-3.5 rounded-2xl font-bold bg-tertiary/20 hover:bg-tertiary/30 text-dark dark:text-light border border-tertiary/30 transition-all flex items-center gap-2 cursor-pointer shrink-0 text-xs shadow-xs"
            >
              <ChartBarIcon className="h-4 w-4 text-primary" />
              <span>Analytics</span>
            </button>

            {/* Add Expense Button */}
            <button
              onClick={() => setIsFormModalOpen(true)}
              className="px-3.5 py-4 rounded-2xl font-bold bg-primary hover:bg-secondary text-white transition-all shadow-lg shadow-primary/25 flex items-center gap-2 cursor-pointer shrink-0 text-xs"
            >
              <PlusCircleIcon className="h-5 w-5" />
              <span>{t("expenses.addExpense") || "Add Expense"}</span>
            </button>
          </div>
        </div>

        {/* Delete Error Notification Banner */}
        {deleteError && (
          <div
            className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-between"
            data-aos="fade-down"
          >
            <span>{deleteError}</span>
            <button
              onClick={() => setDeleteError("")}
              className="font-bold underline cursor-pointer hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Expense Charts Section (Rendered if analytics toggled) */}
        {!fetching && isAnalyticsOpen && expenses.length > 0 && (
          <div
            className="grid grid-cols-1 gap-8 p-7 rounded-[2rem] bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 shadow-sm"
            data-aos="fade-up"
          >
            <div className="flex items-center justify-between border-b border-tertiary/15 pb-4">
              <div>
                <h3 className="text-lg font-bold font-heading">
                  Spending Analytics & Trends
                </h3>
                <p className="text-xs text-dark/50 dark:text-light/50">
                  Comprehensive overview of monthly outflows
                </p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20">
                Monthly Overview
              </span>
            </div>
            <ExpenseChart expenses={expenses} type="line" />
          </div>
        )}

        {/* Transactions Section Header & Controls */}
        <div
          className="flex flex-col space-y-4 pt-2 border-b border-tertiary/20 pb-4"
          data-aos="fade-up"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                <ListBulletIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-dark dark:text-light tracking-tight">
                    {filterType === "recurring"
                      ? "Recurring Expense Templates"
                      : t("dashboard.recentTransactions") ||
                        "Recent Transactions"}
                  </h2>
                  <span className="text-xs font-mono font-bold px-3 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-xs">
                    {filterType === "recurring"
                      ? recurringList.length
                      : `${filteredExpenses.length} / ${expenses.length}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Search Bar & View Mode Toggles */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              {filterType !== "recurring" && (
                <div className="relative flex-grow sm:w-72">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark/40 dark:text-light/40">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      t("expenses.searchPlaceholder") ||
                      "Search category, description, room..."
                    }
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 text-xs font-semibold focus:outline-none focus:border-primary shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark/40 hover:text-primary cursor-pointer"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}

              {/* View Switches (Hidden for Recurring tab) */}
              {filterType !== "recurring" && (
                <div className="flex items-center p-1.5 rounded-2xl bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 shadow-sm self-end">
                  <button
                    onClick={() => setViewMode("card")}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      viewMode === "card"
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-dark/70 dark:text-light/70 hover:text-primary"
                    }`}
                    title="Card View"
                  >
                    <Squares2X2Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {t("expenses.cardView") || "Card"}
                    </span>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      viewMode === "list"
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-dark/70 dark:text-light/70 hover:text-primary"
                    }`}
                    title="List View"
                  >
                    <ListBulletIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {t("expenses.listView") || "List"}
                    </span>
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-dark/70 dark:text-light/70 hover:text-primary"
                    }`}
                    title="Grid View"
                  >
                    <TableCellsIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {t("expenses.gridView") || "Grid"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
            <div className="flex items-center gap-1 text-xs text-dark/40 dark:text-light/40 font-bold mr-1 shrink-0">
              <FunnelIcon className="h-3.5 w-3.5" />
              <span>Filter:</span>
            </div>

            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs ${
                filterType === "all"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-tertiary/10 hover:bg-tertiary/20 text-dark/70 dark:text-light/70 border border-tertiary/20"
              }`}
            >
              All Transactions ({expenses.length})
            </button>

            <button
              onClick={() => setFilterType("personal")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs ${
                filterType === "personal"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-tertiary/10 hover:bg-tertiary/20 text-dark/70 dark:text-light/70 border border-tertiary/20"
              }`}
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Personal Expenses</span>
            </button>

            <button
              onClick={() => setFilterType("split")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs ${
                filterType === "split"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-tertiary/10 hover:bg-tertiary/20 text-dark/70 dark:text-light/70 border border-tertiary/20"
              }`}
            >
              <UserGroupIcon className="h-3.5 w-3.5" />
              <span>Room Split Shares</span>
            </button>

            <button
              onClick={() => setFilterType("recurring")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs ${
                filterType === "recurring"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-tertiary/10 hover:bg-tertiary/20 text-dark/70 dark:text-light/70 border border-tertiary/20"
              }`}
            >
              <ArrowPathIcon className="h-3.5 w-3.5" />
              <span>Recurring Commitments ({recurringList.length})</span>
            </button>

            <button
              onClick={() => exportExpensesPDF()}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs bg-tertiary/10 hover:bg-tertiary/20 text-dark/70 dark:text-light/70 border border-tertiary/20"
            >
              <DocumentArrowDownIcon className="h-3.5 w-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Transactions & Recurring Display Area */}
        <div className="w-full" data-aos="fade-up" data-aos-delay="100">
          {filterType === "recurring" ? (
            recurringFetching ? (
              <div className="p-12 text-center text-sm text-dark/50 dark:text-light/50 bg-white/50 dark:bg-dark/50 rounded-[2rem] border border-tertiary/20">
                Loading recurring commitments...
              </div>
            ) : recurringList.length === 0 ? (
              <div className="p-16 text-center space-y-4 max-w-md mx-auto bg-white/50 dark:bg-dark/50 rounded-[2rem] border border-tertiary/20 shadow-sm">
                <ArrowPathIcon className="h-12 w-12 text-primary mx-auto opacity-50" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-dark dark:text-light">
                    No recurring commitments active
                  </p>
                  <p className="text-xs text-dark/60 dark:text-light/60">
                    Add subscriptions, rent, or utilities to auto-generate
                    monthly bills.
                  </p>
                </div>
                <button
                  onClick={() => setIsRecurringModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary transition-all border border-primary/20 cursor-pointer shadow-xs"
                >
                  Add Recurring Commitment
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recurringList.map((item) => (
                  <div
                    key={item._id}
                    className="p-7 rounded-[2rem] bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-xl transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold uppercase font-mono border border-primary/20 shadow-xs">
                          {item.category || "General"}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-tertiary/20 text-dark/70 dark:text-light/70 font-mono">
                          {item.frequency}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-dark dark:text-light">
                        {item.description}
                      </h3>
                      <p className="text-xs text-dark/50 dark:text-light/50">
                        Last generated:{" "}
                        {item.lastGeneratedDate
                          ? new Date(
                              item.lastGeneratedDate,
                            ).toLocaleDateString()
                          : "Never"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-tertiary/15">
                      <div>
                        <p className="text-xl font-extrabold font-heading text-primary">
                          {currencySymbol}
                          {item.amount?.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-dark/40 dark:text-light/40 font-bold uppercase">
                          Commitment
                        </p>
                      </div>

                      <button
                        onClick={() => deleteRecurring(item._id)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shadow-xs"
                        title="Delete Recurring Template"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : fetching ? (
            <div className="p-12 text-center text-sm text-dark/50 dark:text-light/50 bg-white/50 dark:bg-dark/50 rounded-[2rem] border border-tertiary/20">
              Loading expenses ledger...
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-16 text-center space-y-4 max-w-md mx-auto bg-white/50 dark:bg-dark/50 rounded-[2rem] border border-tertiary/20 shadow-sm">
              <WalletIcon className="h-12 w-12 text-primary mx-auto opacity-50" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-dark dark:text-light">
                  {t("expenses.noExpenses") || "No expenses logged yet"}
                </p>
                <p className="text-xs text-dark/60 dark:text-light/60">
                  Click the button above to add your first transaction.
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-secondary text-white transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                Add First Expense
              </button>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="p-16 text-center space-y-3 max-w-md mx-auto bg-white/50 dark:bg-dark/50 rounded-[2rem] border border-tertiary/20 shadow-sm">
              <MagnifyingGlassIcon className="h-10 w-10 text-primary mx-auto opacity-50" />
              <p className="text-sm font-semibold text-dark dark:text-light">
                No matching transactions found
              </p>
              <p className="text-xs text-dark/60 dark:text-light/60">
                Try clearing your search query or switching filter categories.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary transition-all border border-primary/20 cursor-pointer shadow-xs"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {viewMode === "card" && (
                <ExpenseCardView
                  expenses={filteredExpenses}
                  onDelete={promptDeleteExpense}
                  markSplitPaymentPaid={markSplitPaymentPaid}
                />
              )}
              {viewMode === "list" && (
                <ExpenseListView
                  expenses={filteredExpenses}
                  onDelete={promptDeleteExpense}
                  markSplitPaymentPaid={markSplitPaymentPaid}
                />
              )}
              {viewMode === "grid" && (
                <ExpenseAgGrid expenses={filteredExpenses} />
              )}
            </>
          )}
        </div>
      </main>

      {/* 1. Add Expense Form Modal */}
      <Transition appear show={isFormModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsFormModalOpen(false)}
        >
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
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-[2rem] bg-white dark:bg-dark border border-tertiary/20 dark:border-tertiary/10 p-8 text-left align-middle shadow-2xl transition-all space-y-6">
                  <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <PlusCircleIcon className="h-5 w-5 text-primary" />
                      </div>
                      <DialogTitle
                        as="h3"
                        className="text-lg font-bold font-heading text-dark dark:text-light"
                      >
                        {t("dashboard.modalTitle") || "New Expense Entry"}
                      </DialogTitle>
                    </div>
                    <button
                      onClick={() => setIsFormModalOpen(false)}
                      className="p-1.5 rounded-xl text-dark/50 dark:text-light/50 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {error && (
                    <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl font-medium">
                      {error}
                    </div>
                  )}

                  {successMessage && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl font-medium">
                      {successMessage}
                    </div>
                  )}

                  <ExpenseForm
                    onSubmitExpense={handleCreateExpense}
                    loading={loading}
                  />
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* 2. Recurring Expenses Modal */}
      <Transition appear show={isRecurringModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsRecurringModalOpen(false)}
        >
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
                <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-[2rem] bg-white dark:bg-dark border border-tertiary/20 dark:border-tertiary/10 p-8 text-left align-middle shadow-2xl transition-all space-y-6">
                  <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <ArrowPathIcon className="h-5 w-5 text-primary" />
                      </div>
                      <DialogTitle
                        as="h3"
                        className="text-lg font-bold font-heading text-dark dark:text-light"
                      >
                        Manage Recurring Commitments
                      </DialogTitle>
                    </div>
                    <button
                      onClick={() => setIsRecurringModalOpen(false)}
                      className="p-1.5 rounded-xl text-dark/50 dark:text-light/50 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {successMessage && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl font-medium">
                      {successMessage}
                    </div>
                  )}

                  <RecurringExpenseForm
                    onSubmitBatch={handleBatchRecurringSubmit}
                    loading={recurringLoading}
                  />
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* 3. Expense Calendar Modal */}
      <Transition appear show={isCalendarModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsCalendarModalOpen(false)}
        >
          {/* ... backdrop ... */}
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
                <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-[2rem] bg-white dark:bg-dark border border-tertiary/20 dark:border-tertiary/10 p-8 text-left align-middle shadow-2xl transition-all space-y-6">
                  <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <CalendarDaysIcon className="h-5 w-5 text-primary" />
                      </div>
                      <DialogTitle
                        as="h3"
                        className="text-lg font-bold font-heading text-dark dark:text-light"
                      >
                        {t("dashboard.calendarModalTitle") ||
                          "Monthly Expense Calendar"}
                      </DialogTitle>
                    </div>
                    <button
                      onClick={() => setIsCalendarModalOpen(false)}
                      className="p-1.5 rounded-xl text-dark/50 dark:text-light/50 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Pass recurringList here */}
                  <ExpenseCalendar
                    expenses={expenses}
                    recurringList={recurringList}
                  />
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* 4. Mock Data Generator Modal */}
      <MockExpenseModal
        isOpen={isMockModalOpen}
        onClose={() => setIsMockModalOpen(false)}
      />

      {/* 5. Confirmation Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
        confirmText="Yes, Delete"
        loading={deleting}
      />

      <Footer />
    </div>
  );
}
