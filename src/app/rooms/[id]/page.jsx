'use client';

import { useState, useEffect, Fragment } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AddRoomExpenseModal from '@/components/AddRoomExpenseModal';
import httpClient from '@/lib/api';
import Cookie from 'js-cookie';
import { useAuthStore } from '@/store/useAuthStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { 
  ArrowLeftIcon, 
  CurrencyDollarIcon, 
  PlusCircleIcon, 
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  UserIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition, TransitionChild } from '@headlessui/react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const getAuthHeaders = () => {
  const token = Cookie.get('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export default function RoomDetailClient() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id;

  const { user } = useAuthStore();
  const { markSplitPaymentPaid, confirmSplitPayment } = useExpenseStore();

  const [room, setRoom] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

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
    fetchRoomDetails();
  }, [roomId]);

  const handleAddExpenseSubmit = async (expenseData) => {
    if (!roomId) return;

    setSubmitting(true);
    setFeedbackMessage('');
    try {
      await httpClient.post(`/rooms/${roomId}/expense`, expenseData, getAuthHeaders());

      setFeedbackMessage('Expense added successfully!');
      setTimeout(() => {
        setFeedbackMessage('');
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-tertiary/20 pb-6" data-aos="fade-down">
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
              {room?.description || "Manage shared group expenses and settlements."}
            </p>
          </div>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-5 py-3 rounded-2xl font-bold bg-primary hover:bg-secondary text-white transition-all shadow-lg shadow-primary/25 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Room Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" data-aos="fade-up">
          <div className="bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 rounded-3xl p-6 shadow-sm space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-dark/60 dark:text-light/60">Total Members</p>
            <p className="text-2xl font-extrabold font-heading text-primary">
              {room?.members?.length || 1}
            </p>
          </div>
          <div className="bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 rounded-3xl p-6 shadow-sm space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-dark/60 dark:text-light/60">Total Room Expenses</p>
            <p className="text-2xl font-extrabold font-heading text-primary">
              ${expenses.reduce((acc, curr) => acc + (curr.totalAmount || curr.amount || 0), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 rounded-3xl p-6 shadow-sm space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-dark/60 dark:text-light/60">Room Creator</p>
            <p className="text-sm font-bold truncate">
              {typeof room?.creator === 'object' ? `${room.creator.firstName || ''} ${room.creator.lastName || ''}`.trim() || room.creator.email : "You"}
            </p>
          </div>
        </div>

        {/* Expenses List Section */}
        <div className="space-y-4" data-aos="fade-up">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-heading">Room Expenses & Settlements</h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">
              {expenses.length} Unified Bills
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-dark/50 dark:text-light/50 bg-white/50 dark:bg-dark/50 rounded-3xl border border-tertiary/20">
              Loading expenses...
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-16 text-center space-y-4 bg-white/50 dark:bg-dark/50 rounded-3xl border border-tertiary/20">
              <CurrencyDollarIcon className="h-12 w-12 text-primary mx-auto opacity-50" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">No expenses recorded yet</p>
                <p className="text-xs text-dark/60 dark:text-light/60">Add your first shared expense to start tracking.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {expenses.map((item, idx) => {
                if (item.type === 'single') {
                  return (
                    <div key={item._id} className="bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 rounded-3xl p-6 flex justify-between items-center shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold uppercase font-mono border border-primary/20">
                            {item.category || 'General'}
                          </span>
                          <span className="text-xs text-dark/50 dark:text-light/50 flex items-center gap-1 font-mono">
                            <CreditCardIcon className="h-3.5 w-3.5" /> {item.mode || 'Cash'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-dark dark:text-light pt-2">{item.description}</h3>
                      </div>
                      <p className="text-xl font-extrabold font-heading text-primary">${item.amount?.toFixed(2)}</p>
                    </div>
                  );
                }

                const creditor = item.paidBy;
                const creditorName = creditor 
                  ? `${creditor.firstName || ''} ${creditor.lastName || ''}`.trim() || creditor.email 
                  : 'Member';

                return (
                  <div key={idx} className="bg-white dark:bg-tertiary/5 border border-primary/30 rounded-3xl p-6 shadow-sm space-y-5">
                    {/* Unified Bill Header (Shown only once) */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-tertiary/10 pb-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold uppercase font-mono border border-primary/20">
                            {item.category || 'General'}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold font-mono border border-amber-500/20 flex items-center gap-1">
                            <UserGroupIcon className="h-3 w-3" /> Split Bill
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-tertiary/10 text-dark/70 dark:text-light/70 text-[10px] font-bold font-mono border border-tertiary/20 flex items-center gap-1">
                            <CreditCardIcon className="h-3 w-3" /> {item.mode}
                          </span>
                          <span className="text-xs text-dark/50 dark:text-light/50 flex items-center gap-1 font-mono">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-dark dark:text-light">{item.description}</h3>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-extrabold font-heading text-primary">${item.totalAmount.toFixed(2)}</p>
                        <p className="text-[10px] text-dark/50 dark:text-light/50 font-bold uppercase tracking-wider">
                          Paid by <strong className="text-dark dark:text-light">{creditorName}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Participant Breakdown Section */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-dark/60 dark:text-light/60 font-heading">
                        Participant Breakdown & Settlement Status
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {item.shares.map((share) => {
                          const debtorId = share.user?._id?.toString() || share.user?.toString();
                          const isUserDebtor = debtorId === currentUserId?.toString();
                          const isUserCreditor = (creditor?._id?.toString() || creditor?.toString()) === currentUserId?.toString();
                          const status = share.settlementStatus || 'unpaid';

                          const debtorName = share.user 
                            ? `${share.user.firstName || ''} ${share.user.lastName || ''}`.trim() || share.user.email 
                            : 'Member';

                          return (
                            <div key={share._id} className="p-4 rounded-2xl bg-tertiary/10 border border-tertiary/20 flex flex-col justify-between space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <UserIcon className="h-4 w-4 text-primary" />
                                  <span className="text-xs font-bold">{debtorName} {isUserDebtor && "(You)"}</span>
                                </div>
                                <span className="text-xs font-extrabold font-mono text-primary">${share.amount?.toFixed(2)}</span>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-tertiary/10">
                                {status === 'settled' ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircleIcon className="h-4 w-4" /> Settled
                                  </span>
                                ) : status === 'pending_confirmation' ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                    <ClockIcon className="h-4 w-4 animate-spin" /> Awaiting Confirmation
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                    <ClockIcon className="h-4 w-4" /> Pending Payment
                                  </span>
                                )}

                                {isUserDebtor && status === 'unpaid' && (
                                  <button
                                    onClick={() => handleMarkPaid(share._id)}
                                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-all cursor-pointer border border-amber-500/20 shadow-sm"
                                  >
                                    Mark as Paid
                                  </button>
                                )}

                                {isUserCreditor && status === 'pending_confirmation' && (
                                  <button
                                    onClick={() => handleConfirm(share._id)}
                                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all cursor-pointer border border-emerald-500/20 shadow-sm animate-pulse"
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
        <Dialog as="div" className="relative z-50" onClose={() => setIsExpenseModalOpen(false)}>
          <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm" />
          </TransitionChild>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
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