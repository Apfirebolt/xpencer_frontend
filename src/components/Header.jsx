'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Cookie from "js-cookie";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useTranslation } from "@/context/LanguageContext";
import { 
  HomeIcon, 
  WalletIcon,
  ChartPieIcon,
  RectangleStackIcon,
  UserGroupIcon,
  InformationCircleIcon,
  Bars3Icon, 
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CodeBracketIcon,
  CpuChipIcon,
  Cog6ToothIcon,
  BellIcon
} from "@heroicons/react/24/outline";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutMegaMenuOpen, setIsAboutMegaMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState(null);

  const { unreadCount, fetchNotifications } = useNotificationStore();
  const { locale, changeLanguage, t } = useTranslation();

  const closeTimeoutRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Initialize theme and check user session on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const userCookie = Cookie.get('user');
    if (userCookie) {
      try {
        const parsedUser = JSON.parse(userCookie);
        setUser(parsedUser);
        fetchNotifications();
      } catch (err) {
        console.error("Failed to parse user cookie:", err);
      }
    }
  }, [pathname, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = () => {
    Cookie.remove('user');
    Cookie.remove('token');
    setUser(null);
    setIsUserDropdownOpen(false);
    router.push('/login');
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAboutMegaMenuOpen(false);
    setIsUserDropdownOpen(false);
  }, [pathname]);

  const handleMouseEnterAbout = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsAboutMegaMenuOpen(true);
  };

  const handleMouseLeaveAbout = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsAboutMegaMenuOpen(false);
    }, 200);
  };

  // Define navigation links with authentication requirements
  const allNavLinks = [
    { name: t("nav.dashboard"), href: "/dashboard", icon: HomeIcon, requiresAuth: true },
    { name: t("nav.budgets"), href: "/budgets", icon: ChartPieIcon, requiresAuth: true },
    { name: t("nav.expenses"), href: "/expenses", icon: RectangleStackIcon, requiresAuth: true },
    { name: t("nav.rooms"), href: "/rooms", icon: UserGroupIcon, requiresAuth: true },
  ];

  // Filter links dynamically based on user authentication status
  const navLinks = allNavLinks.filter((link) => (link.requiresAuth ? user : true));

  const aboutSubLinks = [
    { name: t("nav.aboutXpencer"), href: "/about", description: t("nav.aboutXpencerDesc"), icon: SparklesIcon },
    { name: t("nav.techStack"), href: "/about/tech", description: t("nav.techStackDesc"), icon: CodeBracketIcon },
  ];

  const currentAvatar = user?.profilePic?.url || null;

  return (
    <header className="relative sticky top-0 z-50 bg-white/80 dark:bg-dark/90 backdrop-blur-xl border-b border-tertiary/20 dark:border-tertiary/10 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand / Logo, Theme Toggle & Language Switcher */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group py-1">
            <div className="relative w-[130px] sm:w-[150px] h-[72px] sm:h-[72px] flex items-center">
              <Image
                src="/brand.png"
                alt="Xpencer Logo"
                fill
                priority
                className="object-contain object-left group-hover:scale-105 transition-transform"
              />
            </div>
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-tertiary/20 hover:bg-tertiary/30 text-primary transition-colors border border-tertiary/30 flex items-center justify-center shadow-inner cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <SunIcon className="h-4 w-4 text-warning" />
            ) : (
              <MoonIcon className="h-4 w-4 text-dark" />
            )}
          </button>

          {/* Header Language Switcher */}
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-tertiary/20 border border-tertiary/30 text-[11px] font-bold">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                locale === 'en'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-dark/70 dark:text-light/70 hover:text-primary'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage('hi')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                locale === 'hi'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-dark/70 dark:text-light/70 hover:text-primary'
              }`}
            >
              HI
            </button>
            <button
              onClick={() => changeLanguage('de')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                locale === 'de'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-dark/70 dark:text-light/70 hover:text-primary'
              }`}
            >
              DE
            </button>
            <button
              onClick={() => changeLanguage('ja')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                locale === 'ja'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-dark/70 dark:text-light/70 hover:text-primary'
              }`}
            >
              JA
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links & Auth Actions */}
        <div className="hidden md:flex items-center gap-6">
          <nav>
            <ul className="flex items-center gap-1.5 font-sans">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className={`px-3.5 py-2 rounded-full font-semibold text-xs flex items-center space-x-1.5 transition-all duration-200 whitespace-nowrap ${
                        isActive 
                          ? 'bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]' 
                          : 'text-dark dark:text-light/80 hover:text-primary dark:hover:text-tertiary hover:bg-primary/10'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                );
              })}

              {/* Hover-triggered "About" Dropdown Wrapper */}
              <li 
                className="relative"
                onMouseEnter={handleMouseEnterAbout}
                onMouseLeave={handleMouseLeaveAbout}
              >
                <button
                  className={`px-3.5 py-2 rounded-full font-semibold text-xs flex items-center space-x-1.5 transition-all duration-200 cursor-pointer ${
                    pathname.startsWith('/about') 
                      ? 'bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]' 
                      : 'text-dark dark:text-light/80 hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  <InformationCircleIcon className="h-4 w-4" />
                  <span>{t("nav.about")}</span>
                  <ChevronDownIcon className={`h-3 w-3 transition-transform duration-200 ${isAboutMegaMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </li>
            </ul>
          </nav>

          {/* Desktop User Dropdown / Auth Section */}
          <div className="flex items-center gap-3 pl-4 border-l border-tertiary/20">
            {user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-primary/10 hover:bg-primary/15 border border-primary/20 text-xs font-semibold text-dark dark:text-light transition-all cursor-pointer relative"
                >
                  {currentAvatar ? (
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                      <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <UserCircleIcon className="h-4 w-4 text-primary shrink-0" />
                  )}
                  <span className="max-w-[140px] truncate">{user.email || user.firstName}</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-white dark:border-dark" />
                  )}
                  <ChevronDownIcon className={`h-3 w-3 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-dark border border-tertiary/20 shadow-xl py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-tertiary/20">
                      <p className="text-[10px] uppercase font-bold text-dark/40 dark:text-light/40">{t("nav.signedInAs")}</p>
                      <p className="text-xs font-bold truncate text-dark dark:text-light">{user.email}</p>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        href="/settings"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Cog6ToothIcon className="h-4 w-4 text-primary" />
                          <span>{t("nav.settings")}</span>
                        </div>
                      </Link>

                      <Link
                        href="/notifications"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <BellIcon className="h-4 w-4 text-primary" />
                          <span>{t("nav.notifications")}</span>
                        </div>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-mono font-bold border border-rose-500/20">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    </div>

                    <div className="border-t border-tertiary/20 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        <span>{t("nav.logout")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-dark dark:text-light hover:bg-primary/10 transition-colors border border-tertiary/30"
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-secondary transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
                >
                  <span>{t("nav.signUp")}</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-dark dark:text-light hover:bg-primary/10 focus:outline-none transition-colors border border-tertiary/20 cursor-pointer relative"
          aria-label="Toggle mobile menu"
        >
          {unreadCount > 0 && !isMobileMenuOpen && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white dark:border-dark" />
          )}
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6 text-primary" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* FULL-SCREEN ANIMATED "ABOUT" MEGA-MENU */}
      <div 
        className={`absolute top-full left-0 w-full bg-white/95 dark:bg-dark/95 backdrop-blur-2xl border-b border-tertiary/20 dark:border-tertiary/10 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden hidden md:block ${
          isAboutMegaMenuOpen ? 'max-h-[500px] opacity-100 py-10 pointer-events-auto' : 'max-h-0 opacity-0 py-0 pointer-events-none'
        }`}
        onMouseEnter={handleMouseEnterAbout}
        onMouseLeave={handleMouseLeaveAbout}
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-3 md:col-span-1 border-r border-tertiary/20 pr-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
              {t("nav.explore")}
            </div>
            <h3 className="text-2xl font-extrabold font-heading text-dark dark:text-light">
              {t("nav.platformInsights")}
            </h3>
            <p className="text-xs text-dark/60 dark:text-light/60">
              {t("nav.platformDesc")}
            </p>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 gap-4">
            {aboutSubLinks.map((item) => {
              const SubIcon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsAboutMegaMenuOpen(false)}
                  className="p-5 rounded-2xl bg-tertiary/5 hover:bg-primary/10 border border-tertiary/20 hover:border-primary/40 transition-all group flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                    <SubIcon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold font-heading text-dark dark:text-light group-hover:text-primary transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-xs text-dark/60 dark:text-light/60 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-light/95 dark:bg-dark/95 backdrop-blur-2xl border-b border-tertiary/20 px-4 py-4 space-y-4 shadow-2xl animate-fadeIn">
          {/* Mobile Language Switcher Bar */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-tertiary/10 border border-tertiary/20">
            <span className="text-xs font-bold text-dark/60 dark:text-light/60">{t("nav.language")}:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  locale === 'en' ? 'bg-primary text-white shadow-sm' : 'text-dark/70 dark:text-light/70'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('hi')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  locale === 'hi' ? 'bg-primary text-white shadow-sm' : 'text-dark/70 dark:text-light/70'
                }`}
              >
                HI
              </button>
              <button
                onClick={() => changeLanguage('de')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  locale === 'de' ? 'bg-primary text-white shadow-sm' : 'text-dark/70 dark:text-light/70'
                }`}
              >
                DE
              </button>
              <button
                onClick={() => changeLanguage('ja')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  locale === 'ja' ? 'bg-primary text-white shadow-sm' : 'text-dark/70 dark:text-light/70'
                }`}
              >
                JA
              </button>
            </div>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'text-dark dark:text-light/90 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          {/* Mobile About Accordion Section */}
          <div className="space-y-2 pt-2 border-t border-tertiary/20">
            <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-dark/40 dark:text-light/40 font-heading">
              {t("nav.aboutAndArchitecture")}
            </p>
            {aboutSubLinks.map((sub) => {
              const SubIcon = sub.icon;
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-dark/80 dark:text-light/80 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <SubIcon className="h-4 w-4 text-primary" />
                  <span>{sub.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile User Dropdown / Auth Section */}
          <div className="pt-4 border-t border-tertiary/20 space-y-3">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-dark dark:text-light">
                  <div className="flex items-center gap-2 truncate">
                    {currentAvatar ? (
                      <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
                        <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <UserCircleIcon className="h-4 w-4 text-primary shrink-0" />
                    )}
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  <Link
                    href="/settings"
                    className="py-2.5 px-4 rounded-xl text-xs font-bold text-dark dark:text-light bg-tertiary/20 hover:bg-tertiary/30 border border-tertiary/30 transition-colors flex items-center gap-2"
                  >
                    <Cog6ToothIcon className="h-4 w-4 text-primary" />
                    <span>{t("nav.settings")}</span>
                  </Link>

                  <Link
                    href="/notifications"
                    className="py-2.5 px-4 rounded-xl text-xs font-bold text-dark dark:text-light bg-tertiary/20 hover:bg-tertiary/30 border border-tertiary/30 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <BellIcon className="h-4 w-4 text-primary" />
                      <span>{t("nav.notifications")}</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-mono font-bold border border-rose-500/20">
                        {unreadCount} {t("nav.new")}
                      </span>
                    )}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span>{t("nav.logout")}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="py-3 text-center rounded-xl text-xs font-bold text-dark dark:text-light hover:bg-primary/10 border border-tertiary/30 transition-colors"
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  href="/register"
                  className="py-3 text-center rounded-xl text-xs font-bold text-white bg-primary hover:bg-secondary transition-all shadow-md shadow-primary/20"
                >
                  {t("nav.signUp")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;