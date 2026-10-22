"use client";

import { useState, useEffect, Fragment } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddRoomExpenseModal from "@/components/AddRoomExpenseModal";
import httpClient from "@/lib/api";
import Cookie from "js-cookie";
import { useAuthStore } from "@/store/useAuthStore";
import { useExpenseStore } from "@/store/useExpenseStore";
import { currencies } from "@/utils/constants";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  PlusCircleIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  UserIcon,
  CreditCardIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Transition, TransitionChild } from "@headlessui/react";
import AOS from "aos";
import "aos/dist/aos.css";

const getAuthHeaders = () => {
  const token = Cookie.get("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export default function RoomDetailClient() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id;

  const { user, initializeAuth } = useAuthStore();
  const { markSplitPaymentPaid, confirmSplitPayment } = useExpenseStore();

  const [room, setRoom] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Add Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const fetchRoomDetails = async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const res = await httpClient.get(`/rooms/${roomId}`, getAuthHeaders());
      const roomData = res.data.room || res.data;
      const expenseData = res.data.expenses || [];

      setRoom(roomData);
      setExpenses(Array.isArray(expenseData) ? expenseData : []);
    } catch (err) {
      console.error("Failed to load room details:", err);
      setError("Failed to load room details or expenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    initializeAuth();
    fetchRoomDetails();
  }, [roomId, initializeAuth]);

  // Extract user preferred currency symbol
  const userCurrencyCode = user?.settings?.currency || "USD";
  const currencyObj = currencies.find((c) => c.code === userCurrencyCode) || {
    symbol: "$",
    code: "USD",
  };
  const currencySymbol = currencyObj.symbol;

  const totalRoomExpenses = expenses.reduce(
    (acc, curr) => acc + (curr.totalAmount || curr.amount || 0),
    0
  );

  // --- Export Room PDF Handler ---
  const exportRoomPDF = () => {
    setExportingPdf(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Decorative Top Banner Header
      doc.setFillColor(99, 102, 241); // Primary brand color
      doc.rect(0, 0, pageWidth, 12, 'F');

      // Title & Metadata Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(30, 41, 59); // Dark slate
      doc.text(`Room Expense Report`, 14, 24);

      doc.setFontSize(12);
      doc.setTextColor(99, 102, 241);
      doc.text(room?.title || "Expense Room", 14, 31);

      // Metadata Box / Sub-header
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // Muted gray
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);
      doc.text(`Total Members: ${room?.members?.length || 1}`, 70, 38);
      doc.text(`Total Room Outflow: ${currencySymbol}${totalRoomExpenses.toFixed(2)}`, 130, 38);

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 43, pageWidth - 14, 43);

      // Build structured rows including participants & settlement status
      const tableColumn = ["Date", "Description", "Category", "Payer / Type", `Total (${currencySymbol})`, "Participant Breakdown & Status"];
      const tableRows = [];

      expenses.forEach((item) => {
        const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A";
        const category = item.category || "General";
        const description = item.description || "No description";

        if (item.type === "single") {
          tableRows.push([
            dateStr,
            description,
            category,
            `Single Expense (${item.mode || "Cash"})`,
            `${currencySymbol}${Number(item.amount || 0).toFixed(2)}`,
            "N/A (Personal Record)"
          ]);
        } else {
          const creditor = item.paidBy;
          const creditorName = creditor
            ? `${creditor.firstName || ""} ${creditor.lastName || ""}`.trim() || creditor.email
            : "Member";

          // Format participants breakdown text cleanly with bullet-like spacing
          const participantDetails = (item.shares || []).map((share) => {
            const debtorName = share.user
              ? `${share.user.firstName || ""} ${share.user.lastName || ""}`.trim() || share.user.email
              : "Member";
            const status = share.settlementStatus || "unpaid";
            const statusText = status === "settled" ? "Settled" : status === "pending_confirmation" ? "Awaiting Conf." : "Pending";
            return `• ${debtorName}: ${currencySymbol}${Number(share.amount || 0).toFixed(2)} [${statusText}]`;
          }).join("\n");

          tableRows.push([
            dateStr,
            description,
            category,
            `Paid by: ${creditorName}`,
            `${currencySymbol}${Number(item.totalAmount || 0).toFixed(2)}`,
            participantDetails
          ]);
        }
      });

      // Generate Table using autotable plugin with robust column styling & padding
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 48,
        theme: "grid",
        headStyles: { 
          fillColor: [99, 102, 241],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          cellPadding: 4
        },
        bodyStyles: {
          textColor: [51, 65, 85],
          fontSize: 8.5,
          cellPadding: 4,
          valign: 'middle'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 22 }, // Date
          1: { cellWidth: 38 }, // Description
          2: { cellWidth: 26 }, // Category
          3: { cellWidth: 30 }, // Payer / Type
          4: { cellWidth: 20, halign: 'right' }, // Total Amount
          5: { cellWidth: 54 }  // Participant Breakdown
        },
        didDrawPage: (data) => {
          // Footer with Page Numbers
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(
            `Page ${doc.internal.getNumberOfPages()}`,
            pageWidth - 20,
            pageHeight - 10,
            { align: 'right' }
          );
          doc.text(
            `Expense Rooms Report — Confidential`,
            14,
            pageHeight - 10
          );
        }
      });

      doc.save(`room-report-${room?.title?.toLowerCase().replace(/\s+/g, '-') || 'expenses'}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("Failed to export room PDF:", err);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleAddExpenseSubmit = async (expenseData) => {
    if (!roomId) return;

    setSubmitting(true);
    setFeedbackMessage("");
    try {
      await httpClient.post(
        `/rooms/${roomId}/expense`,
        expenseData,
        getAuthHeaders(),
      );

      setFeedbackMessage("Expense added successfully!");
      setTimeout(() => {
        setFeedbackMessage("");
        setIsExpenseModalOpen(false);
        fetchRoomDetails();
      }, 1200);
    } catch (err) {
      console.error("Failed to add expense:", err);
      setError(err.response?.data?.error || "Failed to add expense.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (shareId) => {
    const result = await markSplitPaymentPaid(shareId);
    if (result.success) {
      fetchRoomDetails();
    }
  };

  const handleConfirm = async (shareId) => {
    const result = await confirmSplitPayment(shareId);
    if (result.success) {
      fetchRoomDetails();
    }
  };

  const currentUserId = user?._id || user?.id;

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light flex flex-col font-sans selection:bg-primary selection:text-white transition-colors duration-200">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12 space-y-8">
        
        {/* Back Button & Header Actions */}
        <div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-tertiary/20 pb-6"
          data-aos="fade-down"
        >
          <div className="space-y-2">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Expense Rooms</span>
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight font-heading">
              {loading ? "Loading Room..." : room?.title || "Room Details"}
            </h1>
            <p className="text-xs text-dark/70 dark:text-light/70 max-w-2xl">
              {room?.description ||
                "Manage shared group expenses and settlements."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={exportRoomPDF}
              disabled={exportingPdf || expenses.length === 0}
              className="px-4 py-3 rounded-2xl font-bold bg-tertiary/20 hover:bg-tertiary/30 text-dark dark:text-light border border-tertiary/30 transition-all flex items-center gap-2 cursor-pointer text-xs disabled:opacity-50 shadow-xs"
            >
              <ArrowDownTrayIcon className="h-4 w-4 text-primary" />
              <span>{exportingPdf ? "Generating PDF..." : "Export Room PDF"}</span>
            </button>

            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-5 py-3 rounded-2xl font-bold bg-primary hover:bg-secondary text-white transition-all shadow-lg shadow-primary/25 flex items-center gap-2 cursor-pointer text-xs"
            >
              <PlusCircleIcon className="h-5 w-5" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Room Stats Overview */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          data-aos="fade-up"
        >
          <div className="p-7 rounded-[2rem] bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 shadow-sm space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-dark/60 dark:text-light/60">
              Total Members
            </p>
            <p className="text-3xl font-extrabold font-heading text-primary">
              {room?.members?.length || 1}
            </p>
          </div>
          <div className="p-7 rounded-[2rem] bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 shadow-sm space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-dark/60 dark:text-light/60">
              Total Room Expenses
            </p>
            <p className="text-3xl font-extrabold font-heading text-primary">
              {currencySymbol}
              {totalRoomExpenses.toFixed(2)}
            </p>
          </div>
          <div className="p-7 rounded-[2rem] bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 shadow-sm space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-dark/60 dark:text-light/60">
              Room Creator
            </p>
            <p className="text-sm font-bold truncate">
              {typeof room?.creator === "object"
                ? `${room.creator.firstName || ""} ${room.creator.lastName || ""}`.trim() ||
                  room.creator.email
                : "You"}
            </p>
          </div>
        </div>

        {/* Expenses List Section */}
        <div className="space-y-4" data-aos="fade-up">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-heading">
              Room Expenses & Settlements
            </h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary font-mono">
              {expenses.length} Unified Bills
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-dark/50 dark:text-light/50 bg-white/50 dark:bg-dark/50 rounded-[2rem] border border-tertiary/20">
              Loading expenses...
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-16 text-center space-y-4 bg-white/50 dark:bg-dark/50 rounded-[2rem] border border-tertiary/20">
              <CurrencyDollarIcon className="h-12 w-12 text-primary mx-auto opacity-50" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">
                  No expenses recorded yet
                </p>
                <p className="text-xs text-dark/60 dark:text-light/60">
                  Add your first shared expense to start tracking.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {expenses.map((item, idx) => {
                if (item.type === "single") {
                  return (
                    <div
                      key={item._id}
                      className="p-7 rounded-[2rem] bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 flex justify-between items-center shadow-sm hover:shadow-xl transition-all"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold uppercase font-mono border border-primary/20 shadow-xs">
                            {item.category || "General"}
                          </span>
                          <span className="text-xs text-dark/50 dark:text-light/50 flex items-center gap-1 font-mono">
                            <CreditCardIcon className="h-3.5 w-3.5" />{" "}
                            {item.mode || "Cash"}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-dark dark:text-light pt-2">
                          {item.description}
                        </h3>
                      </div>
                      <p className="text-2xl font-extrabold font-heading text-primary">
                        {currencySymbol}
                        {item.amount?.toFixed(2)}
                      </p>
                    </div>
                  );
                }

                const creditor = item.paidBy;
                const creditorName = creditor
                  ? `${creditor.firstName || ""} ${creditor.lastName || ""}`.trim() ||
                    creditor.email
                  : "Member";

                return (
                  <div
                    key={idx}
                    className="p-7 rounded-[2rem] bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-primary/40 shadow-lg shadow-primary/5 space-y-5"
                  >
                    {/* Unified Bill Header (Shown only once) */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-tertiary/15 pb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold uppercase font-mono border border-primary/20 shadow-xs">
                            {item.category || "General"}
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold font-mono border border-amber-500/20 flex items-center gap-1.5 shadow-xs">
                            <UserGroupIcon className="h-3 w-3" /> Split Bill
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-tertiary/10 text-dark/70 dark:text-light/70 text-[10px] font-bold font-mono border border-tertiary/20 flex items-center gap-1.5">
                            <CreditCardIcon className="h-3 w-3" /> {item.mode}
                          </span>
                          <span className="text-xs text-dark/50 dark:text-light/50 flex items-center gap-1 font-mono">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-dark dark:text-light">
                          {item.description}
                        </h3>
                      </div>

                      <div className="text-right">
                        <p className="text-3xl font-extrabold font-heading text-primary">
                          {currencySymbol}
                          {item.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-dark/50 dark:text-light/50 font-bold uppercase tracking-wider pt-0.5">
                          Paid by{" "}
                          <strong className="text-dark dark:text-light">
                            {creditorName}
                          </strong>
                        </p>
                      </div>
                    </div>

                    {/* Participant Breakdown Section */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-dark/60 dark:text-light/60 font-heading">
                        Participant Breakdown & Settlement Status
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {item.shares.map((share) => {
                          const debtorId =
                            share.user?._id?.toString() ||
                            share.user?.toString();
                          const isUserDebtor =
                            debtorId === currentUserId?.toString();
                          const isUserCreditor =
                            (creditor?._id?.toString() ||
                              creditor?.toString()) ===
                            currentUserId?.toString();
                          const status = share.settlementStatus || "unpaid";

                          const debtorName = share.user
                            ? `${share.user.firstName || ""} ${share.user.lastName || ""}`.trim() ||
                              share.user.email
                            : "Member";

                          return (
                            <div
                              key={share._id}
                              className="p-4.5 rounded-2xl bg-tertiary/10 border border-tertiary/20 flex flex-col justify-between space-y-3 shadow-xs"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <UserIcon className="h-4 w-4 text-primary" />
                                  <span className="text-xs font-bold">
                                    {debtorName} {isUserDebtor && "(You)"}
                                  </span>
                                </div>
                                <span className="text-xs font-extrabold font-mono text-primary">
                                  {currencySymbol}
                                  {share.amount?.toFixed(2)}
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-tertiary/15">
                                {status === "settled" ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                                    <CheckCircleIcon className="h-4 w-4" />{" "}
                                    Settled
                                  </span>
                                ) : status === "pending_confirmation" ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                                    <ClockIcon className="h-4 w-4 animate-spin" />{" "}
                                    Awaiting Confirmation
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                                    <ClockIcon className="h-4 w-4" /> Pending
                                    Payment
                                  </span>
                                )}

                                {isUserDebtor && status === "unpaid" && (
                                  <button
                                    onClick={() => handleMarkPaid(share._id)}
                                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-all cursor-pointer border border-amber-500/20 shadow-xs"
                                  >
                                    Mark as Paid
                                  </button>
                                )}

                                {isUserCreditor &&
                                  status === "pending_confirmation" && (
                                    <button
                                      onClick={() => handleConfirm(share._id)}
                                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all cursor-pointer border border-emerald-500/20 shadow-xs animate-pulse"
                                    >
                                      Confirm Receipt
                                    </button>
                                  )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add Expense Modal */}
      <Transition appear show={isExpenseModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsExpenseModalOpen(false)}
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
                <AddRoomExpenseModal
                  room={room}
                  onClose={() => setIsExpenseModalOpen(false)}
                  onSubmit={handleAddExpenseSubmit}
                  submitting={submitting}
                  error={error}
                  feedbackMessage={feedbackMessage}
                />
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Footer />
    </div>
  );
}