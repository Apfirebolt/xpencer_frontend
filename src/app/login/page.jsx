"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "@/context/LanguageContext";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import {
  ArrowRightIcon,
  LockClosedIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AOS from "aos";
import "aos/dist/aos.css";

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin, loading, error } = useAuthStore(); // Assuming you'll add googleLogin to your Zustand store
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
      setLocalError(
        t?.login?.errorEmptyFields || "Please enter your email and password.",
      );
      return;
    }

    const result = await login({ email, password });

    if (result.success) {
      router.push("/dashboard");
    }
  }

  // Handle Google OAuth Success Response
  async function handleGoogleSuccess(credentialResponse) {
    setLocalError("");
    try {
      // Send Google credential token to backend/Zustand action
      const result = await googleLogin(credentialResponse.credential);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setLocalError(result.error || "Google authentication failed.");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setLocalError("An unexpected error occurred during Google sign in.");
    }
  }

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light flex flex-col font-sans selection:bg-primary selection:text-white transition-colors">
        <Header />

        <main className="flex-grow flex items-center justify-center px-4 sm:px-6 py-12">
          {/* Unified Single Container with Zero Gaps */}
          <div
            data-aos="fade-up"
            className="w-full max-w-5xl bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2"
          >
            {/* Left Side: Form Fields */}
            <div className="p-8 sm:p-12 flex flex-col justify-center space-y-6">
              {/* Brand Header */}
              <div
                className="flex flex-col items-center justify-center space-y-2 mb-2"
                data-aos="fade-down"
                data-aos-delay="100"
              >
                <div className="relative w-[240px] md:w-[350px] h-[90px] md:h-[150px] flex items-center justify-center">
                  <Image
                    src="/brand.png"
                    alt="Xpencer Brand"
                    fill
                    priority
                    className="object-contain"
                  />
                </div>
                <h1 className="text-2xl font-extrabold tracking-wider font-heading text-dark dark:text-light pt-1">
                  <span className="text-primary">X</span> Pencer
                </h1>
                <p className="text-xs text-dark/60 dark:text-light/60 font-sans leading-relaxed text-center">
                  {t("login.subtitle") ||
                    "Sign in to manage your financial ledger and budgets."}
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4 font-sans"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                {(error || localError) && (
                  <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl font-medium">
                    {localError || error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading"
                  >
                    {t("login.emailLabel") || "Email Address"}
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
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading"
                  >
                    {t("login.passwordLabel") || "Password"}
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
                  className="w-full py-3 text-sm font-bold text-white bg-primary hover:bg-secondary transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer mt-2 rounded-xl"
                >
                  <span>
                    {loading
                      ? t("login.signingIn") || "Signing in..."
                      : t("login.signInButton") || "Sign in to Xpence"}
                  </span>
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-2">
                <div className="flex-grow border-t border-tertiary/20" />
                <span className="px-3 text-[11px] uppercase tracking-wider text-dark/40 font-bold">
                  {t("login.orContinueWith") || "Or continue with"}
                </span>
                <div className="flex-grow border-t border-tertiary/20" />
              </div>

              {/* Google Sign-In Button */}
              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    setLocalError(
                      "Google Sign-In was unsuccessful. Please try again.",
                    )
                  }
                  useOneTap
                  theme="outline"
                  shape="pill"
                  width="100%"
                />
              </div>

              {/* Footer Link */}
              <div
                className="text-center text-xs text-dark/60 dark:text-light/60 font-sans pt-2 border-t border-tertiary/20 dark:border-tertiary/10"
                data-aos="fade-in"
                data-aos-delay="300"
              >
                {t("login.noAccountPrompt") || "Don't have an account?"}{" "}
                <Link
                  href="/register"
                  className="text-primary hover:underline font-bold"
                >
                  {t("login.signUpText") || "Sign up"}
                </Link>
              </div>
            </div>

            {/* Right Side: Smaller Compact Background Image Container */}
            <div className="hidden lg:relative lg:flex items-center justify-center bg-tertiary/5 p-6 overflow-hidden min-h-[420px]">
              <div className="absolute inset-4 rounded-2xl overflow-hidden shadow-inner">
                <Image
                  src="/background.png"
                  alt="Xpencer Background"
                  fill
                  priority
                  className="object-cover opacity-90 dark:opacity-70 scale-105 hover:scale-100 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/50 via-dark/10 to-transparent" />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </GoogleOAuthProvider>
  );
}