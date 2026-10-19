"use client";

import { useState, Fragment, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RadioIcon, ArrowRightIcon, LockClosedIcon, EnvelopeIcon, UserIcon, IdentificationIcon } from "@heroicons/react/24/outline";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import httpClient from "../../lib/api";
import AOS from "aos";
import "aos/dist/aos.css";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Sending all fields to /auth/register
      const res = await httpClient.post("/auth/register", { 
        firstName,
        lastName,
        username, 
        email, 
        password 
      });

      // Redirect on success (e.g. to login or dashboard)
      router.push("/login");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "An error occurred during registration.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Fragment>
      <Header />
      <main className="min-h-screen bg-light dark:bg-dark flex items-center justify-center p-6 transition-colors">
        <div 
          data-aos="fade-up"
          className="w-full max-w-lg bg-white dark:bg-tertiary/5 border border-tertiary/20 dark:border-tertiary/10 rounded-3xl shadow-sm p-8 space-y-8 my-10"
        >
          
          {/* Brand Header */}
          <div className="text-center space-y-3" data-aos="fade-down" data-aos-delay="100">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 mb-1">
              <RadioIcon className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-wider font-heading text-dark dark:text-light">
              SoftGenie <span className="text-primary">Beats</span>
            </h1>
            <p className="text-xs text-dark/60 dark:text-light/60 font-sans leading-relaxed">
              Create your studio account to start producing tracks.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-sans" data-aos="fade-up" data-aos-delay="200">
            {error && (
              <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* First Name & Last Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
                  First Name <span className="text-dark/40 dark:text-light/40 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark/30 dark:text-light/30">
                    <IdentificationIcon className="h-4 w-4" />
                  </span>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary text-dark dark:text-light placeholder-dark/30 dark:placeholder-light/30 shadow-inner"
                    placeholder="Amit"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="lastName" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
                  Last Name <span className="text-dark/40 dark:text-light/40 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark/30 dark:text-light/30">
                    <IdentificationIcon className="h-4 w-4" />
                  </span>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary text-dark dark:text-light placeholder-dark/30 dark:placeholder-light/30 shadow-inner"
                    placeholder="Prafulla"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
                Producer Handle *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark/30 dark:text-light/30">
                  <UserIcon className="h-4 w-4" />
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary text-dark dark:text-light placeholder-dark/30 dark:placeholder-light/30 shadow-inner"
                  placeholder="beatmaker_99"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
                Producer Email *
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
                  placeholder="producer@softgenie.org"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
                  Password *
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

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-xs font-bold text-dark dark:text-light uppercase tracking-wider font-heading">
                  Confirm Password *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark/30 dark:text-light/30">
                    <LockClosedIcon className="h-4 w-4" />
                  </span>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-dark border border-tertiary/30 rounded-xl focus:outline-none focus:border-primary text-dark dark:text-light placeholder-dark/30 dark:placeholder-light/30 shadow-inner"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer mt-2"
            >
              <span>{loading ? "Initializing Studio..." : "Create Studio Account"}</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center text-xs text-dark/60 dark:text-light/60 font-sans pt-2 border-t border-tertiary/20 dark:border-tertiary/10" data-aos="fade-in" data-aos-delay="300">
            Already have a studio account?{" "}
            <Link href="/login" className="text-primary hover:underline font-bold">
              Sign in
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </Fragment>
  );
}