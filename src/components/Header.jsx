'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookie from "js-cookie";
import { useNotificationStore } from "@/store/useNotificationStore";
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
        // Fetch unread notification count on load if logged in
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

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Budgets", href: "/budgets", icon: ChartPieIcon },
    { name: "Expenses", href: "/expenses", icon: RectangleStackIcon },
    { name: "Rooms", href: "/rooms", icon: UserGroupIcon },
  ];

  const aboutSubLinks = [
    { name: "About Xpencer", href: "/about", description: "Our mission, vision, and core financial tracking philosophy.", icon: SparklesIcon },
    { name: "Tech Stack", href: "/about/tech", description: "Built with Next.js, Mongoose, AG Grid, and Chart.js analytics.", icon: CodeBracketIcon },
    { name: "Security & Privacy", href: "/about/security", description: "JWT authentication, encrypted data, and secure cookie storage.", icon: ShieldCheckIcon },
    { name: "API & Swagger Docs", href: "/api-docs", description: "Explore full-stack OpenAPI documentation and backend routes.", icon: CpuChipIcon },
  ];

  const currentAvatar = user?.profilePic?.url || null;

  return (
    <header className="relative sticky top-0 z-50 bg-white/80 dark:bg-dark/90 backdrop-blur-xl border-b border-tertiary/20 dark:border-tertiary/10 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand / Logo & Theme Toggle */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform">
              <WalletIcon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-wider font-heading">
              X <span className="text-primary"> Pencer</span> 
            </span>
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
                  <span>About</span>
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
                      <p className="text-[10px] uppercase font-bold text-dark/40 dark:text-light/40">Signed in as</p>
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
                          <span>Settings</span>
                        </div>
                      </Link>

                      <Link
                        href="/notifications"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <BellIcon className="h-4 w-4 text-primary" />
                          <span>Notifications</span>
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
                        <span>Logout</span>
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
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-secondary transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
                >
                  <span>Sign up</span>
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
              Explore Xpencer
            </div>
            <h3 className="text-2xl font-extrabold font-heading text-dark dark:text-light">
              Platform Insights & Architecture
            </h3>
            <p className="text-xs text-dark/60 dark:text-light/60">
              Discover the engineering principles, security standards, and advanced toolsets powering Xpencer.
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
        <div className="md:hidden bg-light/95 dark:bg-dark/95 backdrop-blur-2xl border-b border-tertiary/20 px-4 py-4 space-y-3 shadow-2xl animate-fadeIn">
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
              About & Architecture
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
                    <span>Settings</span>
                  </Link>

                  <Link
                    href="/notifications"
                    className="py-2.5 px-4 rounded-xl text-xs font-bold text-dark dark:text-light bg-tertiary/20 hover:bg-tertiary/30 border border-tertiary/30 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <BellIcon className="h-4 w-4 text-primary" />
                      <span>Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-mono font-bold border border-rose-500/20">
                        {unreadCount} new
                      </span>
                    )}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="py-3 text-center rounded-xl text-xs font-bold text-dark dark:text-light hover:bg-primary/10 border border-tertiary/30 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="py-3 text-center rounded-xl text-xs font-bold text-white bg-primary hover:bg-secondary transition-all shadow-md shadow-primary/20"
                >
                  Sign up
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