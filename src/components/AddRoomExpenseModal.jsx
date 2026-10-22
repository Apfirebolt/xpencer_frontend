"use client";

import { useState, forwardRef, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DialogPanel, DialogTitle } from "@headlessui/react";
import { expenseMode, expenseCategories } from "@/utils/constants";
import { useAuthStore } from "@/store/useAuthStore";

const AddRoomExpenseModal = forwardRef(function AddRoomExpenseModal({ room, onClose, onSubmit, loading, error, feedbackMessage }, ref) {
  const { user } = useAuthStore();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food & Dining");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState("Cash");
  const [paidBy, setPaidBy] = useState("");
  const [splitBetween, setSplitBetween] = useState([]);

  // Initialize defaults when room or user loads
  useEffect(() => {
    if (user && user._id) {
      setPaidBy(user._id);
    }
    if (room?.members) {
      // Default all members checked for splitting
      const memberIds = room.members.map((m) => (typeof m === "object" ? m._id : m));
      setSplitBetween(memberIds);
    }
  }, [room, user]);

  const toggleSplitMember = (memberId) => {
    setSplitBetween((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !room || splitBetween.length === 0) return;

    onSubmit({
      amount: parseFloat(amount),
      category,
      description: description.trim() || "Room expense",
      mode,
      paidBy,
      splitBetween,
    });
  };

  return (
    <DialogPanel ref={ref} className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white dark:bg-dark border border-tertiary/20 p-8 text-left align-middle shadow-2xl transition-all space-y-6">
      <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
        <DialogTitle as="h3" className="text-lg font-bold font-heading text-dark dark:text-light">
          Add Expense to {room?.title}
        </DialogTitle>
        <button onClick={onClose} className="p-1.5 rounded-xl text-dark/50 hover:bg-primary/10 hover:text-primary cursor-pointer">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {error && <div className="text-xs text-rose-600 bg-rose-500/10 p-3 rounded-xl font-medium">{error}</div>}
      {feedbackMessage && <div className="text-xs text-emerald-600 bg-emerald-500/10 p-3 rounded-xl font-medium">{feedbackMessage}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider font-heading">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary shadow-inner cursor-pointer"
            >
              {expenseCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider font-heading">Paid By *</label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary shadow-inner cursor-pointer"
              required
            >
              {room?.members?.map((member) => {
                const memberId = typeof member === "object" ? member._id : member;
                const memberName = typeof member === "object" ? member.name || member.email : member;
                return (
                  <option key={memberId} value={memberId}>
                    {memberName} {memberId === user?._id && "(You)"}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider font-heading">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary shadow-inner"
            placeholder="Hotel bill..."
          />
        </div>

        {/* Split Checkbox Section */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider font-heading">
            Split Expense Between Members *
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto p-3 rounded-2xl bg-tertiary/5 border border-tertiary/20">
            {room?.members?.map((member) => {
              const memberId = typeof member === "object" ? member._id : member;
              const memberName = typeof member === "object" ? member.name || member.email : member;

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
                    {memberName} {memberId === room.creator && "(Creator)"}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <button type="submit" disabled={loading || splitBetween.length === 0} className="w-full py-3 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-xl transition-all shadow-lg cursor-pointer mt-2 disabled:opacity-50">
          {loading ? "Adding Expense..." : "Submit & Split Expense"}
        </button>
      </form>
    </DialogPanel>
  );
});

export default AddRoomExpenseModal;