"use client";

import { useState, forwardRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DialogPanel, DialogTitle } from "@headlessui/react";
import { useTranslation } from "@/context/LanguageContext";

const InviteMemberModal = forwardRef(function InviteMemberModal({ room, onClose, onSubmit, loading, error, feedbackMessage }, ref) {
  const { t } = useTranslation();

  const [inviteUserEmail, setInviteUserEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inviteUserEmail || !room) return;
    onSubmit({ email: inviteUserEmail.trim(), message: inviteMessage.trim() });
    setInviteUserEmail("");
    setInviteMessage("");
  };

  return (
    <DialogPanel ref={ref} className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-dark border border-tertiary/20 p-8 text-left align-middle shadow-2xl transition-all space-y-6">
      <div className="flex items-center justify-between border-b border-tertiary/20 pb-4">
        <DialogTitle as="h3" className="text-lg font-bold font-heading text-dark dark:text-light">
          {t("inviteMemberModal.modalTitle") || "Invite Member to"} {room?.title}
        </DialogTitle>
        <button onClick={onClose} className="p-1.5 rounded-xl text-dark/50 hover:bg-primary/10 hover:text-primary cursor-pointer">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {error && <div className="text-xs text-rose-600 bg-rose-500/10 p-3 rounded-xl font-medium">{error}</div>}
      {feedbackMessage && <div className="text-xs text-emerald-600 bg-emerald-500/10 p-3 rounded-xl font-medium">{feedbackMessage}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider font-heading">
            {t("inviteMemberModal.emailLabel") || "User Email *"}
          </label>
          <input
            type="email"
            value={inviteUserEmail}
            onChange={(e) => setInviteUserEmail(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary shadow-inner"
            placeholder={t("inviteMemberModal.emailPlaceholder") || "Enter recipient User Email..."}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider font-heading">
            {t("inviteMemberModal.messageLabel") || "Notification Message"}
          </label>
          <textarea
            rows={2}
            value={inviteMessage}
            onChange={(e) => setInviteMessage(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary shadow-inner"
            placeholder={t("inviteMemberModal.messagePlaceholder") || "You are invited to join..."}
          />
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-xl transition-all shadow-lg cursor-pointer">
          {loading ? (t("inviteMemberModal.sending") || "Sending...") : (t("inviteMemberModal.submitBtn") || "Send Join Invitation")}
        </button>
      </form>
    </DialogPanel>
  );
});

export default InviteMemberModal;