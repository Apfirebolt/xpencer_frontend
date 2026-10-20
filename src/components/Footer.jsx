'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { 
  WalletIcon, 
  ArrowRightIcon, 
  ShieldCheckIcon, 
  ChartPieIcon, 
  UserGroupIcon 
} from "@heroicons/react/24/outline";

const Footer = () => {
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || t('footer.defaultSuccess'));
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || t('footer.defaultError'));
      }
    } catch (error) {
      setStatus('error');
      setMessage(t('footer.networkError'));
    }
  };

  return (
    <footer className="bg-light dark:bg-dark border-t border-tertiary/20 dark:border-tertiary/10 text-dark/70 dark:text-light/70 transition-colors">
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Left Column: Brand, Description & Core Features */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform">
                  <WalletIcon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-2xl font-extrabold tracking-wider font-heading text-dark dark:text-light">
                  X <span className="text-primary"> Pencer</span>
                </span>
              </Link>
              <p className="text-sm text-dark/60 dark:text-light/60 max-w-md leading-relaxed font-sans">
                {t('footer.description')}
              </p>
            </div>

            {/* Navigation Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
                  {t('footer.platform')}
                </h3>
                <ul className="space-y-2 text-sm font-sans">
                  <li>
                    <Link href="/dashboard" className="hover:text-primary transition-colors">
                      {t('footer.dashboard')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/budgets" className="hover:text-primary transition-colors">
                      {t('footer.budgetPlanner')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/expenses" className="hover:text-primary transition-colors">
                      {t('footer.expenseTracker')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/rooms" className="hover:text-primary transition-colors">
                      {t('footer.billSplits')}
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
                  {t('footer.capabilities')}
                </h3>
                <ul className="space-y-2 text-sm font-sans">
                  <li className="flex items-center gap-1.5 text-dark/50 dark:text-light/50">
                    <ChartPieIcon className="h-4 w-4 text-primary" />
                    <span>{t('footer.smartCategories')}</span>
                  </li>
                  <li className="flex items-center gap-1.5 text-dark/50 dark:text-light/50">
                    <UserGroupIcon className="h-4 w-4 text-secondary" />
                    <span>{t('footer.groupSplitting')}</span>
                  </li>
                  <li className="flex items-center gap-1.5 text-dark/50 dark:text-light/50">
                    <ShieldCheckIcon className="h-4 w-4 text-success" />
                    <span>{t('footer.secureLedger')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Newsletter / Early Access Card */}
          <div className="lg:col-span-5 p-8 rounded-3xl bg-tertiary/10 dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-dark dark:text-light font-heading">
                {t('footer.newsletterTitle')}
              </h3>
              <p className="text-xs text-dark/60 dark:text-light/60 font-sans leading-relaxed">
                {t('footer.newsletterSubtitle')}
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-3 font-sans">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  required
                  disabled={status === 'loading'}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary text-dark dark:text-light placeholder-dark/30 dark:placeholder-light/30 shadow-inner disabled:opacity-60"
                />
              </div>

              {message && (
                <div className={`text-xs px-3 py-2 rounded-lg font-medium transition-all ${
                  status === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer"
              >
                <span>{status === 'loading' ? t('footer.joining') : t('footer.getEarlyAccess')}</span>
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-tertiary/20 dark:border-tertiary/10 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-dark/50 dark:text-light/50 font-sans gap-4">
          <p>&copy; {new Date().getFullYear()} {t('footer.rights')}</p>
          
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              {t('footer.terms')}
            </Link>
            <Link href="/security" className="hover:text-primary transition-colors">
              {t('footer.security')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;