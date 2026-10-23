"use client";

import { useState, forwardRef, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DialogPanel, DialogTitle } from "@headlessui/react";
import { expenseMode, expenseCategories, currencies } from "@/utils/constants";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "@/context/LanguageContext";

const AddRoomExpenseModal = forwardRef(function AddRoomExpenseModal({ room, onClose, onSubmit, loading, error, feedbackMessage }, ref) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  
  // Extract user preferred currency symbol
  const userCurrencyCode = user?.settings?.currency || 'USD';
  const currencyObj = currencies.find((c) => c.code === userCurrencyCode) || { symbol: '$', code: 'USD' };
  const currencySymbol = currencyObj.symbol;

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food & Dining");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState("Cash");
  const [paidBy, setPaidBy] = useState("");
  const [splitBetween, setSplitBetween] = useState([]);

  console.log('Currency Symbol:', currencySymbol)
  
  // Unequal split states
  const [isUnequal, setIsUnequal] = useState(false);
  const [customSplits, setCustomSplits] = useState({});
  const [validationError, setValidationError] = useState("");

  // Initialize defaults when room or user loads
  useEffect(() => {
    if (user && user._id) {
      setPaidBy(user._id);
    }
    if (room?.members) {
      const memberIds = room.members.map((m) => (typeof m === "object" ? m._id : m));
      setSplitBetween(memberIds);
    }
  }, [room, user]);

  const toggleSplitMember = (memberId) => {
    setSplitBetween((prev) => {
      const updated = prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId];
      if (!updated.includes(memberId)) {
        setCustomSplits((curr) => {
          const copy = { ...curr };
          delete copy[memberId];
          return copy;
        });
      }
      return updated;
    });
  };

  const handleCustomSplitChange = (memberId, val) => {
    setCustomSplits((prev) => ({
      ...prev,
      [memberId]: val,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (!amount || !room || splitBetween.length === 0) return;

    const parsedAmount = parseFloat(amount);
    let finalSplitData = splitBetween;

    if (isUnequal) {
      let sum = 0;
      const formattedSplits = {};

      for (const id of splitBetween) {
        const val = parseFloat(customSplits[id]) || 0;
        sum += val;
        formattedSplits[id] = val;
      }

      if (Math.abs(sum - parsedAmount) > 0.01) {
        setValidationError(
          t("addRoomExpenseModal.unequalSumError") || `The sum of custom split amounts (${currencySymbol}${sum.toFixed(2)}) must equal the total amount (${currencySymbol}${parsedAmount.toFixed(2)}).`
        );
        return;
      }

      finalSplitData = formattedSplits;
    }

    onSubmit({
      amount: parsedAmount,
      category,
      description: description.trim() || (t("addRoomExpenseModal.defaultDesc") || "Room expense"),
      mode,
      paidBy,
      splitBetween: finalSplitData,
      isUnequal,
    });
  };

  return (
    <DialogPanel ref={ref} className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white dark:bg-dark border border-tertiary/20 p-8 text-left align-middle shadow-2xl transition-all space-y-6">
      <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
        <DialogTitle as="h3" className="text-lg font-bold font-heading text-dark dark:text-light">
          {t("addRoomExpenseModal.modalTitle") || "Add Expense to"} {room?.title}
        </DialogTitle>
        <button onClick={onClose} className="p-1.5 rounded-xl text-dark/50 hover:bg-primary/10 hover:text-primary cursor-pointer">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {error && <div className="text-xs text-rose-600 bg-rose-500/10 p-3 rounded-xl font-medium">{error}</div>}
      {validationError && <div className="text-xs text-rose-600 bg-rose-500/10 p-3 rounded-xl font-medium">{validationError}</div>}
      {feedbackMessage && <div className="text-xs text-emerald-600 bg-emerald-500/10 p-3 rounded-xl font-medium">{feedbackMessage}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider font-heading">
            {t("addRoomExpenseModal.amountLabel") || "Amount *"} <span className="font-normal text-primary">({currencySymbol})</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary shadow-inner"
            placeholder={`${currencySymbol} 0.00`}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider font-heading">
              {t("addRoomExpenseModal.categoryLabel") || "Category *"}
            </label>
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
            <label className="block text-xs font-bold uppercase tracking-wider font-heading">
              {t("addRoomExpenseModal.paidByLabel") || "Paid By *"}
            </label>
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
                    {memberName} {memberId === user?._id && (t("addRoomExpenseModal.youLabel") || "(You)")}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider font-heading">
            {t("addRoomExpenseModal.descriptionLabel") || "Description"}
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary shadow-inner"
            placeholder={t("addRoomExpenseModal.descriptionPlaceholder") || "Hotel bill..."}
          />
        </div>

        {/* Split Checkbox Section */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider font-heading">
              {t("addRoomExpenseModal.splitBetweenLabel") || "Split Expense Between Members *"}
            </label>
            
            {/* Unequal Split Checkbox Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="unequalSplitToggle"
                checked={isUnequal}
                onChange={(e) => setIsUnequal(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-tertiary/30 cursor-pointer"
              />
              <label htmlFor="unequalSplitToggle" className="text-xs font-semibold cursor-pointer select-none">
                {t("addRoomExpenseModal.unequalSplitLabel") || "Split Unequally"}
              </label>
            </div>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto p-3 rounded-2xl bg-tertiary/5 border border-tertiary/20">
            {room?.members?.map((member) => {
              const memberId = typeof member === "object" ? member._id : member;
              const memberName = typeof member === "object" ? member.name || member.email : member;
              const isChecked = splitBetween.includes(memberId);

              return (
                <div key={memberId} className="flex items-center justify-between gap-3 py-1">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`split-${memberId}`}
                      checked={isChecked}
                      onChange={() => toggleSplitMember(memberId)}
                      className="w-4 h-4 text-primary rounded border-tertiary/30 cursor-pointer"
                    />
                    <label htmlFor={`split-${memberId}`} className="text-xs font-medium cursor-pointer">
                      {memberName} {memberId === room.creator && (t("addRoomExpenseModal.creatorLabel") || "(Creator)")}
                    </label>
                  </div>

                  {/* Individual custom amount input when unequal splitting is checked */}
                  {isUnequal && isChecked && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-dark/60 dark:text-light/60">{currencySymbol}</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={customSplits[memberId] || ""}
                        onChange={(e) => handleCustomSplitChange(memberId, e.target.value)}
                        className="w-24 px-2.5 py-1.5 text-xs bg-white dark:bg-dark border border-tertiary/30 rounded-lg focus:outline-none focus:border-primary shadow-inner"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button type="submit" disabled={loading || splitBetween.length === 0} className="w-full py-3 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-xl transition-all shadow-lg cursor-pointer mt-2 disabled:opacity-50">
          {loading ? (t("addRoomExpenseModal.adding") || "Adding Expense...") : (t("addRoomExpenseModal.submitBtn") || "Submit & Split Expense")}
        </button>
      </form>
    </DialogPanel>
  );
});

export default AddRoomExpenseModal;