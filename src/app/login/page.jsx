"use client";

import { useState, Fragment, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "@/context/LanguageContext";
import { WalletIcon, ArrowRightIcon, LockClosedIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AOS from "aos";
import "aos/dist/aos.css";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuthStore();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError("");

    if (!email || !password) {
      setLocalError(t?.login?.errorEmptyFields || "Please enter your email and password.");
      return;
    }

    const result = await login({ email, password });

    if (result.success) {
      router.push("/dashboard");
    }
  }

  return (
    <Fragment>
      <Header />
      <main className="min-h-screen bg-light dark:bg-dark flex items-center justify-center p-6 transition-colors">
        <div 
          data-aos="fade-up"
          className="w-full max-w-md bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 rounded-3xl shadow-sm p-8 space-y-8"
        >
          
          {/* Brand Header */}
          <div className="text-center space-y-3" data-aos="fade-down" data-aos-delay="100">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 mb-1">
              <WalletIcon className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-wider font-heading text-dark dark:text-light">
              X <span className="text-primary">Pencer</span>
            </h1>
            <p className="text-xs text-dark/60 dark:text-light/60 font-sans leading-relaxed">
              {t('login.subtitle') || "Sign in to manage your financial ledger and budgets."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 font-sans" data-aos="fade-up" data-aos-delay="200">
            {(error || localError) && (
              <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl font-medium">
                {localError || error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
                {t('login.emailLabel') || "Email Address"}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark/30 dark:text-light/30">
                  <EnvelopeIcon className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary text-dark dark:text-light placeholder-dark/30 dark:placeholder-light/30 shadow-inner"
                  placeholder="user@xpencer.org"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
                {t('login.passwordLabel') || "Password"}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark/30 dark:text-light/30">
                  <LockClosedIcon className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary text-dark dark:text-light placeholder-dark/30 dark:placeholder-light/30 shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? (t('login.signingIn') || "Signing in...") : (t('login.signInButton') || "Sign in to Xpence")}</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center text-xs text-dark/60 dark:text-light/60 font-sans pt-2 border-t border-tertiary/20 dark:border-tertiary/10" data-aos="fade-in" data-aos-delay="300">
            {t('login.noAccountPrompt') || "Don't have an account?"}{" "}
            <Link href="/register" className="text-primary hover:underline font-bold">
              {t('login.signUpText') || "Sign up"}
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </Fragment>
  );
}