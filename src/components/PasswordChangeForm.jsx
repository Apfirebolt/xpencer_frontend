'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function PasswordChangeForm() {
  const { changePassword, loading, error } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback('');
    setLocalError('');

    if (newPassword !== confirmPassword) {
      setLocalError('New passwords do not match.');
      return;
    }

    const result = await changePassword({ currentPassword, newPassword });
    if (result.success) {
      setFeedback('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="space-y-1">
        <h3 className="text-lg font-bold font-heading">Change Password</h3>
        <p className="text-xs text-dark/60 dark:text-light/60">Ensure your account is using a long, random password to stay secure.</p>
      </div>

      {error && <div className="text-xs text-rose-600 bg-rose-500/10 p-3 rounded-xl font-medium">{error}</div>}
      {localError && <div className="text-xs text-rose-600 bg-rose-500/10 p-3 rounded-xl font-medium">{localError}</div>}
      {feedback && <div className="text-xs text-emerald-600 bg-emerald-500/10 p-3 rounded-xl font-medium">{feedback}</div>}

      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider font-heading">Current Password *</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark/30">
            <LockClosedIcon className="h-4 w-4" />
          </span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary shadow-inner"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider font-heading">New Password *</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark/30">
            <LockClosedIcon className="h-4 w-4" />
          </span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary shadow-inner"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider font-heading">Confirm New Password *</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark/30">
            <LockClosedIcon className="h-4 w-4" />
          </span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary shadow-inner"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="py-3 px-6 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
      >
        <span>{loading ? "Updating..." : "Update Password"}</span>
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </form>
  );
}