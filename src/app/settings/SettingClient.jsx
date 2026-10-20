'use client';

import { useState, useEffect, Fragment } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileUpdateForm from '@/components/ProfileUpdateForm';
import PasswordChangeForm from '@/components/PasswordChangeForm';
import ProfilePicForm from '@/components/ProfilePicForm';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  UserCircleIcon, 
  LockClosedIcon, 
  PhotoIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function SettingClient() {
  const { user, fetchProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    fetchProfile();
  }, [fetchProfile]);

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light flex flex-col font-sans selection:bg-primary selection:text-white transition-colors duration-200">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-16 space-y-10">
        
        {/* Page Header */}
        <div className="border-b border-tertiary/25 pb-6" data-aos="fade-down">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase border border-primary/20 mb-3">
            <Cog6ToothIcon className="h-4 w-4" />
            <span>Preferences</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
            Account Settings
          </h1>
          <p className="text-xs text-dark/60 dark:text-light/60 mt-1">
            Update your personal information, secure your password, and manage your avatar.
          </p>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-tertiary/20 pb-4" data-aos="fade-up">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'bg-tertiary/10 hover:bg-tertiary/20 text-dark dark:text-light'
            }`}
          >
            <UserCircleIcon className="h-4 w-4" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('avatar')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'avatar'
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'bg-tertiary/10 hover:bg-tertiary/20 text-dark dark:text-light'
            }`}
          >
            <PhotoIcon className="h-4 w-4" />
            <span>Profile Picture</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'password'
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'bg-tertiary/10 hover:bg-tertiary/20 text-dark dark:text-light'
            }`}
          >
            <LockClosedIcon className="h-4 w-4" />
            <span>Security & Password</span>
          </button>
        </div>

        {/* Form Container Panel */}
        <div className="bg-white/80 dark:bg-dark/80 border border-tertiary/20 dark:border-tertiary/10 rounded-3xl p-8 shadow-sm" data-aos="fade-up" data-aos-delay="100">
          {activeTab === 'profile' && <ProfileUpdateForm user={user} />}
          {activeTab === 'avatar' && <ProfilePicForm user={user} />}
          {activeTab === 'password' && <PasswordChangeForm />}
        </div>

      </main>

      <Footer />
    </div>
  );
}