'use client';

import { useState, useEffect, Fragment } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import httpClient from '@/lib/api';
import Cookie from 'js-cookie';
import { 
  ArrowLeftIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  PlusCircleIcon, 
  TagIcon, 
  CalendarIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
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

  const [room, setRoom] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [description, setDescription] = useState('');
  const [splitBetween, setSplitBetween] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const fetchRoomDetails = async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const res = await httpClient.get(`/rooms/${roomId}`, getAuthHeaders());
      const roomData = res.data.room || res.data;
      const expenseData = res.data.expenses || res.data.roomExpenses || [];

      setRoom(roomData);
      setExpenses(Array.isArray(expenseData) ? expenseData : []);
      // Default all members checked for splitting
      if (roomData?.members) {
        setSplitBetween(roomData.members.map(m => typeof m === 'object' ? m._id : m));
      }
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

  const toggleSplitMember = (memberId) => {
    setSplitBetween(prev => 
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const handleAddExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !roomId) return;

    setSubmitting(true);
    setFeedbackMessage('');
    try {
      await httpClient.post(`/rooms/${roomId}/expense`, {
        amount: parseFloat(amount),
        category,
        description: description.trim() || 'Room expense',
        splitBetween
      }, getAuthHeaders());

      setFeedbackMessage('Expense added successfully!');
      setAmount('');
      setDescription('');
      setTimeout(() => {
        setFeedbackMessage('');
        setIsExpenseModalOpen(false);
        fetchRoomDetails(); // Refresh room data and expenses
      }, 1200);
    } catch (err) {
      console.error("Failed to add expense:", err);
      setError(err.response?.data?.error || "Failed to add expense.");
    } finally {
      setSubmitting(false);
    }
  };

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
              ${expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 rounded-3xl p-6 shadow-sm space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-dark/60 dark:text-light/60">Room Creator</p>
            <p className="text-sm font-bold truncate">
              {typeof room?.creator === 'object' ? (room.creator.name || room.creator.email) : "You"}
            </p>
          </div>
        </div>

        {/* Expenses List Section */}
        <div className="space-y-4" data-aos="fade-up">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-heading">Room Expenses</h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">
              {expenses.length} Recorded
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
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div 
                  key={expense._id} 
                  className="bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase font-mono">
                        {expense.category || 'General'}
                      </span>
                      <span className="text-xs text-dark/50 dark:text-light/50 flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {new Date(expense.createdAt || expense.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold">{expense.description}</h3>
                    <p className="text-xs text-dark/60 dark:text-light/60">
                      Paid by: <span className="font-semibold">{expense.paidBy?.name || expense.paidBy?.email || "Member"}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-extrabold font-heading text-primary">${expense.amount?.toFixed(2)}</p>
                    <p className="text-[10px] text-dark/50 dark:text-light/50">
                      Split across {expense.splitBetween?.length || 1} members
                    </p>
                  </div>
                </div>
              ))}
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
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-dark border border-tertiary/20 p-8 text-left align-middle shadow-2xl transition-all space-y-6">
                  <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
                    <DialogTitle as="h3" className="text-lg font-bold font-heading text-dark dark:text-light">
                      Add Expense to {room?.title}
                    </DialogTitle>
                    <button onClick={() => setIsExpenseModalOpen(false)} className="p-1.5 rounded-xl text-dark/50 hover:bg-primary/10 hover:text-primary cursor-pointer">
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {error && <div className="text-xs text-rose-600 bg-rose-500/10 p-3 rounded-xl font-medium">{error}</div>}
                  {feedbackMessage && <div className="text-xs text-emerald-600 bg-emerald-500/10 p-3 rounded-xl font-medium">{feedbackMessage}</div>}

                  <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider font-heading">Amount ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary shadow-inner"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider font-heading">Category *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary shadow-inner cursor-pointer"
                      >
                        <option value="Food & Dining">Food & Dining</option>
                        <option value="Transport">Transport</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Bills & Utilities">Bills & Utilities</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Travel">Travel</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider font-heading">Description</label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary shadow-inner"
                        placeholder="Dinner bill..."
                      />
                    </div>

                    {/* Split Checkbox Section */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-xs font-bold uppercase tracking-wider font-heading">
                        Split Expense with Members
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto p-3 rounded-2xl bg-tertiary/5 border border-tertiary/20">
                        {room?.members?.map((member) => {
                          const memberId = typeof member === 'object' ? member._id : member;
                          const memberName = typeof member === 'object' ? (member.name || member.email) : member;

                          return (
                            <div key={memberId} className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id={`split-${memberId}`}
                                checked={splitBetween.includes(memberId)}
                                onChange={() => toggleSplitMember(memberId)}
                                className="w-4 h-4 text-primary rounded border-tertiary/30 cursor-pointer"
                              />
                              <label htmlFor={`split-${memberId}`} className="text-xs font-medium cursor-pointer">
                                {memberName}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button type="submit" disabled={submitting} className="w-full py-3 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-xl transition-all shadow-lg cursor-pointer mt-2">
                      {submitting ? "Adding..." : "Submit Expense"}
                    </button>
                  </form>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Footer />
    </div>
  );
}