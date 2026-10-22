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
import { useTranslation } from "@/context/LanguageContext";
import { currencies } from "@/utils/constants";
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
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  Dialog,
  Transition,
  TransitionChild,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
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

  const { user, initializeAuth, getJoiningRoomRequests } = useAuthStore();

  const {
    pendingConfirmations,
    fetchingPending,
    fetchPendingConfirmations,
    confirmSplitPayment,
  } = useExpenseStore();

  const { t } = useTranslation();

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

  // Extract user preferred currency symbol
  const userCurrencyCode = user?.settings?.currency || "USD";
  const currencyObj = currencies.find((c) => c.code === userCurrencyCode) || {
    symbol: "$",
    code: "USD",
  };
  const currencySymbol = currencyObj.symbol;

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
    initializeAuth();
    fetchRooms();
    fetchJoinRequests();
    fetchPendingConfirmations();
  }, [fetchRooms, fetchPendingConfirmations, initializeAuth]);

  async function handleInviteSubmit({ email, message }) {
    setFeedbackMessage("");
    const result = await inviteUser(selectedRoom._id, email, message);
    if (result.success) {
      setFeedbackMessage(t("roomClient.inviteSuccess") || "Invitation sent successfully!");
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
      setFeedbackMessage(t("roomClient.expenseSuccess") || "Room expense added and split successfully!");
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

  const handleConfirmReceipt = async (expenseId) => {
    await confirmSplitPayment(expenseId);
  };

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
              <UserGroupIcon className="h-4 w-4" />
              <span>{t("roomClient.badge") || "Expense Rooms Suite"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              {t("roomClient.title") || "Collaborative Split Groups"}
            </h1>
            <p className="text-xs text-dark/60 dark:text-light/60">
              {t("roomClient.subtitle") || "Manage shared living spaces, travel expenses, and peer settlements."}
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl font-bold bg-primary hover:bg-secondary text-white transition-all shadow-lg shadow-primary/25 flex items-center gap-2 cursor-pointer shrink-0 text-xs"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>{t("roomClient.createRoomBtn") || "Create Expense Room"}</span>
          </button>
        </div>

        {/* Action Queues Section (Accordions) */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          data-aos="fade-up"
        >
          {/* 1. Pending Settlement Confirmations Accordion */}
          <Disclosure defaultOpen={true}>
            {({ open }) => (
              <div className="p-6 rounded-[2rem] bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 shadow-sm space-y-4">
                <DisclosureButton className="flex items-center justify-between w-full border-b border-tertiary/15 pb-3 text-left cursor-pointer group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <CheckBadgeIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold font-heading">
                        {t("roomClient.pendingConfirmationsTitle") || "Pending Payment Confirmations"}
                      </h2>
                      <p className="text-[11px] text-dark/50 dark:text-light/50">
                        {t("roomClient.pendingConfirmationsSubtitle") || "Action required from creditors"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
                      {pendingConfirmations.length}
                    </span>
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform duration-300 text-dark/60 ${open ? "rotate-180" : ""}`}
                    />
                  </div>
                </DisclosureButton>

                <DisclosurePanel className="space-y-3 pt-1 animate-fadeIn">
                  {fetchingPending ? (
                    <div className="text-center py-6 text-xs text-dark/50 dark:text-light/50">
                      {t("roomClient.loadingSettlements") || "Loading settlement requests..."}
                    </div>
                  ) : pendingConfirmations.length === 0 ? (
                    <div className="text-center py-6 text-xs text-dark/50 dark:text-light/50 bg-tertiary/5 rounded-2xl border border-tertiary/10">
                      {t("roomClient.noPendingSettlements") || "No pending settlement confirmations required."}
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {pendingConfirmations.map((exp) => {
                        const debtorName = exp.user
                          ? `${exp.user.firstName || ""} ${exp.user.lastName || ""}`.trim() ||
                            exp.user.email
                          : (t("roomClient.member") || "Member");
                        return (
                          <div
                            key={exp._id}
                            className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 shadow-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold font-mono uppercase border border-primary/20">
                                  {currencySymbol}
                                  {exp.amount?.toFixed(2)}
                                </span>
                                <span className="text-xs font-semibold text-dark dark:text-light truncate max-w-[150px]">
                                  {exp.description}
                                </span>
                              </div>
                              <p className="text-[11px] text-dark/60 dark:text-light/60">
                                {t("roomClient.paidBy") || "Paid by"}:{" "}
                                <strong className="text-dark dark:text-light">
                                  {debtorName}
                                </strong>
                              </p>
                            </div>

                            <button
                              onClick={() => handleConfirmReceipt(exp._id)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-emerald-500/20 shrink-0 animate-pulse shadow-xs"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                              <span>{t("roomClient.confirmBtn") || "Confirm"}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </DisclosurePanel>
              </div>
            )}
          </Disclosure>

          {/* 2. Pending Room Joining Requests Accordion */}
          <Disclosure defaultOpen={true}>
            {({ open }) => (
              <div className="p-6 rounded-[2rem] bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 shadow-sm space-y-4">
                <DisclosureButton className="flex items-center justify-between w-full border-b border-tertiary/15 pb-3 text-left cursor-pointer group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <BellAlertIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold font-heading">
                        {t("roomClient.joinRequestsTitle") || "Pending Room Join Requests"}
                      </h2>
                      <p className="text-[11px] text-dark/50 dark:text-light/50">
                        {t("roomClient.joinRequestsSubtitle") || "Approve or reject room access"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
                      {joinRequests.length}
                    </span>
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform duration-300 text-dark/60 ${open ? "rotate-180" : ""}`}
                    />
                  </div>
                </DisclosureButton>

                <DisclosurePanel className="space-y-3 pt-1 animate-fadeIn">
                  {fetchingRequests ? (
                    <div className="text-center py-6 text-xs text-dark/50 dark:text-light/50">
                      {t("roomClient.loadingRequests") || "Loading requests..."}
                    </div>
                  ) : joinRequests.length === 0 ? (
                    <div className="text-center py-6 text-xs text-dark/50 dark:text-light/50 bg-tertiary/5 rounded-2xl border border-tertiary/10">
                      {t("roomClient.noJoinRequests") || "No pending room join requests at the moment."}
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {joinRequests.map((req) => (
                        <div
                          key={req._id}
                          className="flex items-center justify-between p-4 rounded-2xl bg-tertiary/10 border border-tertiary/20 shadow-xs"
                        >
                          <div className="space-y-1">
                            <p className="text-xs font-bold">
                              {req.room?.title ||
                                req.roomTitle ||
                                (t("roomClient.expenseRoomDefault") || "Expense Room")}
                            </p>
                            <p className="text-[11px] text-dark/70 dark:text-light/70 truncate max-w-[160px]">
                              {t("roomClient.fromLabel") || "From"}:{" "}
                              <span className="font-semibold">
                                {req.user?.name ||
                                  req.user?.email ||
                                  req.senderEmail}
                              </span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() =>
                                handleRequestResponse(req._id, "accepted")
                              }
                              disabled={loading}
                              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold shadow-xs"
                              title={t("roomClient.acceptTitle") || "Accept Request"}
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                              <span className="hidden sm:inline">{t("roomClient.acceptBtn") || "Accept"}</span>
                            </button>
                            <button
                              onClick={() =>
                                handleRequestResponse(req._id, "rejected")
                              }
                              disabled={loading}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold shadow-xs"
                              title={t("roomClient.rejectTitle") || "Reject Request"}
                            >
                              <XCircleIcon className="h-4 w-4" />
                              <span className="hidden sm:inline">{t("roomClient.rejectBtn") || "Reject"}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </DisclosurePanel>
              </div>
            )}
          </Disclosure>
        </div>

        {/* Rooms Grid Section */}
        <div className="space-y-6" data-aos="fade-up">
          <div className="flex items-center justify-between border-b border-tertiary/20 pb-3">
            <h2 className="text-xl font-bold font-heading">
              {t("roomClient.activeRoomsTitle") || "Your Active Rooms"}
            </h2>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {rooms.length} {t("roomClient.roomsActiveSuffix") || "Rooms Active"}
            </span>
          </div>

          {fetching ? (
            <div className="p-12 text-center text-sm text-dark/50 dark:text-light/50 bg-white/50 dark:bg-dark/50 rounded-[2rem] border border-tertiary/20">
              {t("roomClient.loadingRooms") || "Loading expense rooms..."}
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-16 text-center space-y-4 max-w-md mx-auto bg-white/50 dark:bg-dark/50 rounded-[2rem] border border-tertiary/20 shadow-sm">
              <UserGroupIcon className="h-12 w-12 text-primary mx-auto opacity-50" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-dark dark:text-light">
                  {t("roomClient.noRoomsTitle") || "No expense rooms found"}
                </p>
                <p className="text-xs text-dark/60 dark:text-light/60">
                  {t("roomClient.noRoomsDesc") || "Create a room to start splitting expenses with friends."}
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-secondary text-white transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                {t("roomClient.createFirstRoomBtn") || "Create First Room"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div
                  key={room._id}
                  className="p-7 rounded-[2rem] bg-white/90 dark:bg-dark/90 backdrop-blur-md border border-tertiary/20 dark:border-tertiary/15 shadow-sm space-y-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold font-heading text-dark dark:text-light">
                        {room.title}
                      </h3>
                      <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold font-mono border border-primary/20 shadow-xs">
                        {room.members?.length || 1} {t("roomClient.membersSuffix") || "Members"}
                      </span>
                    </div>
                    <p className="text-xs text-dark/70 dark:text-light/70 line-clamp-2 leading-relaxed">
                      {room.description}
                    </p>
                  </div>

                  <div className="border-t border-tertiary/15 pt-4 flex items-center justify-between gap-3">
                    <button
                      onClick={() => router.push(`/rooms/${room._id}`)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-tertiary/10 hover:bg-tertiary/20 text-dark dark:text-light transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>{t("roomClient.viewRoomBtn") || "View Room"}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedRoom(room);
                          setIsInviteModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl bg-tertiary/20 hover:bg-tertiary/30 text-dark dark:text-light transition-all flex items-center justify-center cursor-pointer shadow-xs"
                        title={t("roomClient.inviteMemberTitle") || "Invite Member"}
                      >
                        <UserPlusIcon className="h-4 w-4 text-primary" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedRoom(room);
                          setIsExpenseModalOpen(true);
                        }}
                        className="px-4.5 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-secondary text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-primary/20"
                        title={t("roomClient.addExpenseTitle") || "Add Room Expense"}
                      >
                        <CurrencyDollarIcon className="h-4 w-4" />
                        <span>{t("roomClient.addExpenseBtn") || "Add Expense"}</span>
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
      <ExpenseRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          fetchRooms();
        }}
      />

      <Transition appear show={isInviteModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsInviteModalOpen(false)}
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