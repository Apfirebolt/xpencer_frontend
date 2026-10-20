'use client';

import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNotificationStore } from '@/store/useNotificationStore';
import { 
  BellIcon, 
  CheckIcon, 
  TrashIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  InformationCircleIcon, 
  CheckBadgeIcon 
} from '@heroicons/react/24/outline';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function NotificationClient() {
  const { 
    notifications, 
    unreadCount, 
    fetching, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotificationStore();

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    fetchNotifications();
  }, [fetchNotifications]);

  // Helper to render appropriate icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'room_invite':
        return <UserGroupIcon className="h-5 w-5 text-primary" />;
      case 'expense_split':
        return <CurrencyDollarIcon className="h-5 w-5 text-emerald-500" />;
      case 'system':
        return <InformationCircleIcon className="h-5 w-5 text-amber-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light flex flex-col font-sans selection:bg-primary selection:text-white transition-colors duration-200">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-16 space-y-8">
        
        {/* Page Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-tertiary/20 pb-6" data-aos="fade-down">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase border border-primary/20 mb-3">
              <BellIcon className="h-4 w-4" />
              <span>Inbox</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading flex items-center gap-3">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="px-3 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold border border-rose-500/20">
                  {unreadCount} unread
                </span>
              )}
            </h1>
          </div>

          {notifications.length > 0 && unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-tertiary/20 hover:bg-tertiary/30 text-dark dark:text-light transition-all border border-tertiary/30 flex items-center gap-2 cursor-pointer"
            >
              <CheckBadgeIcon className="h-4 w-4 text-primary" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Notifications List Container */}
        <div className="space-y-4" data-aos="fade-up">
          {fetching ? (
            <div className="p-12 text-center text-sm text-dark/50 dark:text-light/50 bg-white/50 dark:bg-dark/50 rounded-3xl border border-tertiary/20">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-16 text-center space-y-4 max-w-md mx-auto bg-white/50 dark:bg-dark/50 rounded-3xl border border-tertiary/20">
              <BellIcon className="h-12 w-12 text-primary mx-auto opacity-40" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-dark dark:text-light">
                  You're all caught up!
                </p>
                <p className="text-xs text-dark/60 dark:text-light/60">
                  No new notifications right now. We'll alert you when something happens.
                </p>
              </div>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm ${
                  item.isRead
                    ? 'bg-white/50 dark:bg-dark/50 border-tertiary/20 opacity-75'
                    : 'bg-white dark:bg-dark border-primary/40 shadow-primary/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 mt-0.5">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold font-heading text-dark dark:text-light">
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs text-dark/70 dark:text-light/70 leading-relaxed">
                      {item.message}
                    </p>
                    <p className="text-[10px] text-dark/40 dark:text-light/40 font-mono">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Just now'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-tertiary/20">
                  {!item.isRead && (
                    <button
                      onClick={() => markAsRead(item._id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Mark as read"
                    >
                      <CheckIcon className="h-3.5 w-3.5" />
                      <span>Mark Read</span>
                    </button>
                  )}

                  <button
                    onClick={() => deleteNotification(item._id)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete notification"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}