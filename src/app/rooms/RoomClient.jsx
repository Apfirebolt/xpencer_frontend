"use client";

import { useState, useEffect, Fragment } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExpenseRoomModal from "@/components/ExpenseRoomModal";
import InviteMemberModal from "@/components/InviteMemberModal";
import AddRoomExpenseModal from "@/components/AddRoomExpenseModal";
import { useAuthStore } from "@/store/useAuthStore";
import { useExpenseRoomStore } from "@/store/useRoomStore";
import { useExpenseStore } from "@/store/useExpenseStore";
import { useRouter } from "next/navigation";
import {
  UserGroupIcon,
  PlusCircleIcon,
  CurrencyDollarIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellAlertIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import {
  Dialog,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function RoomClient() {
  const {
    rooms,
    fetching,
    loading,
    error,
    fetchRooms,
    inviteUser,
    respondToJoinRequest,
    addRoomExpense,
  } = useExpenseRoomStore();
  
  const { getJoiningRoomRequests } = useAuthStore();
  
  const { 
    pendingConfirmations, 
    fetchingPending, 
    fetchPendingConfirmations, 
    confirmSplitPayment 
  } = useExpenseStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Join Requests State
  const [joinRequests, setJoinRequests] = useState([]);
  const [fetchingRequests, setFetchingRequests] = useState(true);

  // Modal States
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const router = useRouter();

  const fetchJoinRequests = async () => {
    setFetchingRequests(true);
    try {
      const result = await getJoiningRoomRequests();
      if (result.success) {
        const data = result.data.requests || result.data;
        setJoinRequests(Array.isArray(data) ? data : []);
      }
    } finally {
      setFetchingRequests(false);
    }
  };

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    fetchRooms();
    fetchJoinRequests();
    fetchPendingConfirmations(); // Fetch pending settlement requests via dedicated store action
  }, [fetchRooms, fetchPendingConfirmations]);

  async function handleInviteSubmit({ email, message }) {
    setFeedbackMessage("");
    const result = await inviteUser(selectedRoom._id, email, message);
    if (result.success) {
      setFeedbackMessage("Invitation sent successfully!");
      setTimeout(() => {
        setFeedbackMessage("");
        setIsInviteModalOpen(false);
      }, 1500);
    }
  }

  async function handleAddExpenseSubmit(expenseData) {
    setFeedbackMessage("");
    const result = await addRoomExpense(selectedRoom._id, expenseData);
    if (result.success) {
      setFeedbackMessage("Room expense added and split successfully!");
      setTimeout(() => {
        setFeedbackMessage("");
        setIsExpenseModalOpen(false);
        fetchPendingConfirmations();
      }, 1500);
    }
  }

  const handleRequestResponse = async (requestId, status) => {
    const result = await respondToJoinRequest(requestId, status);
    if (result.success) {
      fetchJoinRequests();
    }
  };

  // Confirm payment receipt as creditor using store action
  const handleConfirmReceipt = async (expenseId) => {
    await confirmSplitPayment(expenseId);
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

        {/* Pending Settlement Confirmations Section (Creditor Action Queue) */}
        <div className="w-full bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 rounded-3xl p-6 shadow-sm space-y-4" data-aos="fade-up">
          <div className="flex items-center justify-between border-b border-tertiary/20 pb-3">
            <div className="flex items-center gap-2">
              <CheckBadgeIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold font-heading">Pending Payment Confirmations</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
              {pendingConfirmations.length}
            </span>
          </div>

          {fetchingPending ? (
            <div className="text-center py-6 text-xs text-dark/50 dark:text-light/50">Loading settlement requests...</div>
          ) : pendingConfirmations.length === 0 ? (
            <div className="text-center py-6 text-xs text-dark/50 dark:text-light/50">
              No pending settlement confirmations required.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingConfirmations.map((exp) => {
                const debtorName = exp.user 
                  ? `${exp.user.firstName || ''} ${exp.user.lastName || ''}`.trim() || exp.user.email 
                  : 'Member';
                return (
                  <div key={exp._id} className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold font-mono uppercase">
                          ${exp.amount?.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-dark dark:text-light">{exp.description}</span>
                      </div>
                      <p className="text-xs text-dark/70 dark:text-light/70">
                        Marked as paid by: <strong className="text-dark dark:text-light">{debtorName}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => handleConfirmReceipt(exp._id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-emerald-500/20 shrink-0 animate-pulse"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Confirm Receipt</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Room Joining Requests Section */}
        <div className="w-full bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 rounded-3xl p-6 shadow-sm space-y-4" data-aos="fade-up">
          <div className="flex items-center justify-between border-b border-tertiary/20 pb-3">
            <div className="flex items-center gap-2">
              <BellAlertIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold font-heading">Pending Room Join Requests</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
              {joinRequests.length}
            </span>
          </div>

          {fetchingRequests ? (
            <div className="text-center py-6 text-xs text-dark/50 dark:text-light/50">Loading requests...</div>
          ) : joinRequests.length === 0 ? (
            <div className="text-center py-6 text-xs text-dark/50 dark:text-light/50">
              No pending room join requests at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {joinRequests.map((req) => (
                <div key={req._id} className="flex items-center justify-between p-4 rounded-2xl bg-tertiary/10 border border-tertiary/20">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">{req.room?.title || req.roomTitle || "Expense Room"}</p>
                    <p className="text-xs text-dark/70 dark:text-light/70">
                      From: <span className="font-semibold">{req.user?.name || req.user?.email || req.senderEmail}</span>
                    </p>
                    {req.notificationMessage && (
                      <p className="text-xs italic text-dark/60 dark:text-light/60">&quot;{req.notificationMessage}&quot;</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRequestResponse(req._id, "accepted")}
                      disabled={loading}
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                      title="Accept Request"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      <span className="hidden sm:inline">Accept</span>
                    </button>
                    <button
                      onClick={() => handleRequestResponse(req._id, "rejected")}
                      disabled={loading}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                      title="Reject Request"
                    >
                      <XCircleIcon className="h-5 w-5" />
                      <span className="hidden sm:inline">Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                <div key={room._id} className="bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold font-heading text-dark dark:text-light">{room.title}</h3>
                      <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold font-mono">
                        {room.members?.length || 1} Members
                      </span>
                    </div>
                    <p className="text-xs text-dark/70 dark:text-light/70 line-clamp-2">{room.description}</p>
                  </div>

                  <div className="border-t border-tertiary/20 pt-4 flex items-center justify-between gap-2">
                    <button
                      onClick={() => router.push(`/rooms/${room._id}`)}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-tertiary/10 hover:bg-tertiary/20 text-dark dark:text-light transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Details</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSelectedRoom(room); setIsInviteModalOpen(true); }}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-tertiary/20 hover:bg-tertiary/30 text-dark dark:text-light transition-all flex items-center gap-1 cursor-pointer"
                        title="Invite User"
                      >
                        <UserPlusIcon className="h-4 w-4 text-primary" />
                      </button>

                      <button
                        onClick={() => { setSelectedRoom(room); setIsExpenseModalOpen(true); }}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-secondary text-white transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-primary/20"
                        title="Add Expense"
                      >
                        <CurrencyDollarIcon className="h-4 w-4" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <ExpenseRoomModal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); fetchRooms(); }} />

      <Transition appear show={isInviteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsInviteModalOpen(false)}>
          <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm" />
          </TransitionChild>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <InviteMemberModal
                  room={selectedRoom}
                  onClose={() => setIsInviteModalOpen(false)}
                  onSubmit={handleInviteSubmit}
                  loading={loading}
                  error={error}
                  feedbackMessage={feedbackMessage}
                />
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isExpenseModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsExpenseModalOpen(false)}>
          <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm" />
          </TransitionChild>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <AddRoomExpenseModal
                  room={selectedRoom}
                  onClose={() => setIsExpenseModalOpen(false)}
                  onSubmit={handleAddExpenseSubmit}
                  loading={loading}
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