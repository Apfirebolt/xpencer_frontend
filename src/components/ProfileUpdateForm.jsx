'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/context/LanguageContext';
import { UserIcon, EnvelopeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function ProfileUpdateForm({ user }) {
  const { updateProfile, loading, error } = useAuthStore();
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback('');

    const result = await updateProfile({ firstName, lastName, email });
    if (result.success) {
      setFeedback(t?.profileUpdate?.successMessage || 'Profile successfully updated!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="space-y-1">
        <h3 className="text-lg font-bold font-heading">{t('profileUpdate.title') || 'Profile Information'}</h3>
        <p className="text-xs text-dark/60 dark:text-light/60">{t('profileUpdate.subtitle') || "Update your account's profile information and email address."}</p>
      </div>

      {error && <div className="text-xs text-rose-600 bg-rose-500/10 p-3 rounded-xl font-medium">{error}</div>}
      {feedback && <div className="text-xs text-emerald-600 bg-emerald-500/10 p-3 rounded-xl font-medium">{feedback}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider font-heading">{t('profileUpdate.firstNameLabel') || 'First Name'} *</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark/30">
              <UserIcon className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary shadow-inner"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider font-heading">{t('profileUpdate.lastNameLabel') || 'Last Name'} *</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark/30">
              <UserIcon className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary shadow-inner"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider font-heading">{t('profileUpdate.emailLabel') || 'Email Address'} *</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark/30">
            <EnvelopeIcon className="h-4 w-4" />
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <span>{loading ? (t('profileUpdate.saving') || 'Saving...') : (t('profileUpdate.saveButton') || 'Save Changes')}</span>
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </form>
  );
}