'use client';

import { useState, useEffect, Fragment } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ExpenseRoomModal from '@/components/ExpenseRoomModal';
import { useExpenseRoomStore } from '@/store/useRoomStore';
import { UserGroupIcon, PlusCircleIcon, XMarkIcon, CurrencyDollarIcon, UserPlusIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function RoomClient() {
  const { rooms, fetching, loading, error, fetchRooms, inviteUser, respondToJoinRequest, addRoomExpense } = useExpenseRoomStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Invite Member Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  // Add Expense to Room Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [description, setDescription] = useState('');
  const [splitBetween, setSplitBetween] = useState([]); // Array of member IDs to split with

  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    fetchRooms();
  }, [fetchRooms]);

  async function handleInviteSubmit(e) {
    e.preventDefault();
    if (!inviteUserId || !selectedRoom) return;

    setFeedbackMessage('');
    const result = await inviteUser(selectedRoom._id, inviteUserId.trim(), inviteMessage.trim());
    if (result.success) {
      setFeedbackMessage('Invitation sent successfully!');
      setInviteUserId('');
      setInviteMessage('');
      setTimeout(() => {
        setFeedbackMessage('');
        setIsInviteModalOpen(false);
      }, 1500);
    }
  }

  async function handleAddExpenseSubmit(e) {
    e.preventDefault();
    if (!amount || !selectedRoom) return;

    setFeedbackMessage('');
    const result = await addRoomExpense(selectedRoom._id, {
      amount: parseFloat(amount),
      category,
      description: description.trim() || 'Room expense',
      splitBetween
    });

    if (result.success) {
      setFeedbackMessage('Room expense added and split successfully!');
      setAmount('');
      setDescription('');
      setSplitBetween([]);
      setTimeout(() => {
        setFeedbackMessage('');
        setIsExpenseModalOpen(false);
      }, 1500);
    }
  }

  const toggleSplitMember = (memberId) => {
    setSplitBetween(prev => 
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light flex flex-col font-sans selection:bg-primary selection:text-white transition-colors duration-200">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-16 space-y-10">
        
        {/* Page Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-tertiary/20 pb-6" data-aos="fade-down">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase border border-primary/20 mb-3">
              <UserGroupIcon className="h-4 w-4" />
              <span>Expense Rooms</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              Collaborative Split Groups
            </h1>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl font-bold bg-primary hover:bg-secondary text-white transition-all shadow-lg shadow-primary/25 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Create Expense Room</span>
          </button>
        </div>

        {/* Rooms Grid */}
        <div className="w-full" data-aos="fade-up">
          {fetching ? (
            <div className="p-12 text-center text-sm text-dark/50 dark:text-light/50 bg-white/50 dark:bg-dark/50 rounded-3xl border border-tertiary/20">
              Loading expense rooms...
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-16 text-center space-y-4 max-w-md mx-auto bg-white/50 dark:bg-dark/50 rounded-3xl border border-tertiary/20">
              <UserGroupIcon className="h-12 w-12 text-primary mx-auto opacity-50" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-dark dark:text-light">No expense rooms found</p>
                <p className="text-xs text-dark/60 dark:text-light/60">Create a room to start splitting expenses with friends.</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary transition-all border border-primary/20 cursor-pointer"
              >
                Create First Room
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div 
                  key={room._id}
                  className="bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold font-heading text-dark dark:text-light">
                        {room.title}
                      </h3>
                      <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold font-mono">
                        {room.members?.length || 1} Members
                      </span>
                    </div>
                    <p className="text-xs text-dark/70 dark:text-light/70 line-clamp-2">
                      {room.description}
                    </p>
                  </div>

                  <div className="border-t border-tertiary/20 pt-4 flex items-center justify-between gap-2">
                    <button
                      onClick={() => { setSelectedRoom(room); setIsInviteModalOpen(true); }}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-tertiary/20 hover:bg-tertiary/30 text-dark dark:text-light transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlusIcon className="h-4 w-4 text-primary" />
                      <span>Invite</span>
                    </button>

                    <button
                      onClick={() => { setSelectedRoom(room); setIsExpenseModalOpen(true); }}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-secondary text-white transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-primary/20"
                    >
                      <CurrencyDollarIcon className="h-4 w-4" />
                      <span>Add Expense</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* 1. Create Room Modal */}
      <ExpenseRoomModal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); fetchRooms(); }} />

      {/* 2. Invite Member Modal */}
      <Transition appear show={isInviteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsInviteModalOpen(false)}>
          <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm" />
          </TransitionChild>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-dark border border-tertiary/20 p-8 text-left align-middle shadow-2xl transition-all space-y-6">
                  <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
                    <DialogTitle as="h3" className="text-lg font-bold font-heading text-dark dark:text-light">
                      Invite Member to {selectedRoom?.title}
                    </DialogTitle>
                    <button onClick={() => setIsInviteModalOpen(false)} className="p-1.5 rounded-xl text-dark/50 hover:bg-primary/10 hover:text-primary cursor-pointer">
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {error && <div className="text-xs text-rose-600 bg-rose-500/10 p-3 rounded-xl font-medium">{error}</div>}
                  {feedbackMessage && <div className="text-xs text-emerald-600 bg-emerald-500/10 p-3 rounded-xl font-medium">{feedbackMessage}</div>}

                  <form onSubmit={handleInviteSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider font-heading">User ID *</label>
                      <input
                        type="text"
                        value={inviteUserId}
                        onChange={(e) => setInviteUserId(e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary shadow-inner"
                        placeholder="Enter recipient User ID..."
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider font-heading">Notification Message</label>
                      <textarea
                        rows={2}
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary shadow-inner"
                        placeholder="You are invited to join..."
                      />
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-xl transition-all shadow-lg cursor-pointer">
                      {loading ? "Sending..." : "Send Join Invitation"}
                    </button>
                  </form>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* 3. Add Room Expense Modal */}
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
                      Add Expense to {selectedRoom?.title}
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
                        placeholder="Group dinner..."
                      />
                    </div>

                    {/* Split Checkbox Section */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-xs font-bold uppercase tracking-wider font-heading">
                        Split Expense with Members
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto p-3 rounded-2xl bg-tertiary/5 border border-tertiary/20">
                        {selectedRoom?.members?.map((member) => {
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
                                {memberName} {memberId === selectedRoom.creator && '(Creator)'}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-3 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-xl transition-all shadow-lg cursor-pointer mt-2">
                      {loading ? "Adding Expense..." : "Submit & Split Expense"}
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