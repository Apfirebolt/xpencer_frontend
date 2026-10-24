'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/context/LanguageContext';
import { useSubscriberStore } from '@/store/useSubscriberStore';
import { 
  ArrowRightIcon, 
  BellAlertIcon,
  ChartBarIcon,
  ChartPieIcon, 
  UserGroupIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

const Footer = () => {
  const { t } = useTranslation();
  const { subscribe, loading } = useSubscriberStore();
  
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    const result = await subscribe(email);

    if (result.success) {
      setStatus('success');
      setMessage(result.message || t('footer.defaultSuccess'));
      setEmail('');
    } else {
      setStatus('error');
      setMessage(result.error || t('footer.defaultError'));
    }
  };

  return (
    <footer className="bg-light dark:bg-dark border-t border-tertiary/20 dark:border-tertiary/10 text-dark/70 dark:text-light/70 transition-colors relative overflow-hidden">
      
      {/* Background ambient lighting blur */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 py-20 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16 items-start">
          
          {/* Left Column: Brand, Description & Navigation */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-4">
              <Link href="/" className="inline-flex items-center gap-3.5 group">
                <div className="relative w-64 h-24 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden group-hover:scale-105 group-hover:border-primary/40 transition-all shadow-sm">
                  <Image 
                    src="/brand.png" 
                    alt="Xpencer Logo" 
                    fill 
                    className="object-contain p-2"
                  />
                </div>
                <span className="text-2xl font-extrabold tracking-tight font-heading text-dark dark:text-light">
                  X <span className="text-primary">Pencer</span>
                </span>
              </Link>
              <p className="text-sm text-dark/60 dark:text-light/60 max-w-md leading-relaxed font-sans">
                {t('footer.description')}
              </p>
            </div>

            {/* Navigation Links Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-2">
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-dark dark:text-light uppercase tracking-widest font-heading">
                  {t('footer.platform')}
                </h3>
                <ul className="space-y-2.5 text-sm font-sans">
                  <li>
                    <Link href="/dashboard" className="hover:text-primary transition-colors inline-block hover:translate-x-1 duration-200">
                      {t('footer.dashboard')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/budgets" className="hover:text-primary transition-colors inline-block hover:translate-x-1 duration-200">
                      {t('footer.budgetPlanner')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/expenses" className="hover:text-primary transition-colors inline-block hover:translate-x-1 duration-200">
                      {t('footer.expenseTracker')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/rooms" className="hover:text-primary transition-colors inline-block hover:translate-x-1 duration-200">
                      {t('footer.billSplits')}
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-dark dark:text-light uppercase tracking-widest font-heading">
                  {t('footer.capabilities')}
                </h3>
                <ul className="space-y-2.5 text-sm font-sans">
                  <li className="flex items-center gap-2 text-dark/60 dark:text-light/60">
                    <ChartPieIcon className="h-4 w-4 text-primary shrink-0" />
                    <span>{t('footer.smartCategories')}</span>
                  </li>
                  <li className="flex items-center gap-2 text-dark/60 dark:text-light/60">
                    <UserGroupIcon className="h-4 w-4 text-secondary shrink-0" />
                    <span>{t('footer.groupSplitting')}</span>
                  </li>
                  <li className="flex items-center gap-2 text-dark/60 dark:text-light/60">
                    <ChartBarIcon className="h-4 w-4 text-secondary shrink-0" />
                    <span>{t('footer.charts')}</span>
                  </li>
                  <li className="flex items-center gap-2 text-dark/60 dark:text-light/60">
                    <BellAlertIcon className="h-4 w-4 text-secondary shrink-0" />
                    <span>{t('footer.alerts')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Sleek Newsletter Card */}
          <div className="lg:col-span-5 p-8 sm:p-10 rounded-3xl bg-white/70 dark:bg-dark/70 backdrop-blur-2xl border border-tertiary/20 dark:border-tertiary/10 space-y-6 shadow-xl relative overflow-hidden group hover:border-primary/30 transition-all">
            
            {/* Card internal top radial glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                <SparklesIcon className="h-3.5 w-3.5 animate-pulse" />
                <span>Stay Updated</span>
              </div>
              <h3 className="text-xl font-extrabold text-dark dark:text-light font-heading tracking-tight">
                {t('footer.newsletterTitle')}
              </h3>
              <p className="text-xs text-dark/60 dark:text-light/60 font-sans leading-relaxed">
                {t('footer.newsletterSubtitle')}
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-4 relative z-10">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3.5 text-sm bg-light/50 dark:bg-dark/50 border border-tertiary/30 rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark dark:text-light placeholder-dark/30 dark:placeholder-light/30 shadow-inner transition-all disabled:opacity-60"
                />
              </div>

              {message && (
                <div className={`text-xs px-3.5 py-2.5 rounded-xl font-medium transition-all animate-fadeIn ${
                  status === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer group/btn"
              >
                <span>{loading ? t('footer.joining') : t('footer.getEarlyAccess')}</span>
                <ArrowRightIcon className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Divider & Copyright */}
        <div className="border-t border-tertiary/20 dark:border-tertiary/10 pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center text-xs text-dark/50 dark:text-light/50 font-sans gap-4">
          <p>&copy; {new Date().getFullYear()} {t('footer.rights')}</p>
          
          <div className="flex space-x-6 font-medium">
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