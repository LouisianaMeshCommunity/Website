"use client";

import React, { useState, useEffect } from "react";
import { Mail, Bell, Calendar, Check, Loader2 } from "lucide-react";

type Theme = "light" | "dark";

// --- THEME HOOK ---
const useTheme = () => {
  const getInitialTheme = (): Theme => {
    if (typeof window !== "undefined" && window.localStorage) {
      const storedTheme = window.localStorage.getItem("theme");
      return (storedTheme as Theme) || "light";
    }
    return "light";
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const rawSetTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    const isDark = newTheme === "dark";
    root.classList.remove(isDark ? "light" : "dark");
    root.classList.add(isDark ? "dark" : "light");
    window.localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    rawSetTheme(theme);
  }, [theme]);

  return [theme, setTheme] as const;
};

export default function EmailSignupPage() {
  // Calling the hook to apply theme classes, but not destructuring 'theme' to avoid ESLint errors
  useTheme();
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    
    // Prepare the parameters for Listmonk
    const params = new URLSearchParams();
    params.append("email", email);
    params.append("nonce", "");

    // MANDATORY LIST: Network Alerts (Max 2x month)
    params.append("l", "9a20b3f8-4ea8-4c42-ae1c-8f426ee77879");

    // OPTIONAL LIST: Network News (If checked)
    if (formData.get("weekly")) {
      params.append("l", "3f08e2e0-0db3-4ffa-a7c2-b71bf6a39f1c");
    }

    try {
      // Using 'no-cors' mode to bypass potential pre-flight blocks
      await fetch("https://lists.gulfcoastmesh.org/subscription/form", {
        method: "POST",
        mode: "no-cors", 
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      // UI Success Feedback
      setStatus({ 
        type: 'success', 
        text: "Subscription request received! Please check your inbox to confirm." 
      });
      (e.target as HTMLFormElement).reset();
    } catch {
      // Catching without 'err' variable to satisfy strict ESLint rules
      setStatus({ 
        type: 'error', 
        text: "Connection error. Please try again later." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat bg-fixed"
         style={{ backgroundImage: `url("/files/images/banner.jpg")` }}>
      
      {/* Visual Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/40 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/80 dark:bg-gray-800/80 p-8 sm:p-10 rounded-2xl shadow-2xl backdrop-blur-md text-gray-800 dark:text-gray-100 border border-white/20 dark:border-gray-700/50">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border-4 border-indigo-200 dark:border-indigo-800 mb-5">
              <Mail className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white mb-2">
              Network Updates
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
              Join the Louisiana Mesh mailing list.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2 ml-1">
                Email Address
              </label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="name@domain.com" 
                required 
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-sm"
              />
            </div>

            {/* List Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold mb-3 ml-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[11px]">
                Subscription Details
              </label>

              {/* Mandatory: Network Alerts */}
              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 shadow-sm transition-all">
                <div className="mt-1">
                  <div className="w-5 h-5 flex items-center justify-center bg-indigo-600 rounded text-white shadow">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-white">
                    <Bell className="w-4 h-4 text-indigo-500" /> Network Alerts
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Important updates and breaking changes; Up to 2 emails a month.
                  </p>
                </div>
              </div>

              {/* Optional: Weekly Meetings */}
              <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 cursor-pointer hover:border-indigo-400 hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all shadow-sm group">
                <div className="mt-1">
                  <input 
                    type="checkbox" 
                    name="weekly" 
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                    <Calendar className="w-4 h-4 text-indigo-500" /> Network News
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Summaries from our weekly community meetings and other news; Up to 1 email a week.
                  </p>
                </div>
              </label>
            </div>

            {/* Status Messages */}
            {status && (
              <div className={`p-4 rounded-xl text-sm font-bold border transition-all ${
                status.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-500 border-red-500/20'
              }`}>
                {status.text}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:scale-[1.02] transition transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Join the Network"}
            </button>
          </form>
          
        </div>

        <p className="text-center mt-10 text-gray-400 dark:text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Louisiana Mesh Community. All rights reserved.
        </p>
      </div>
    </div>
  );
}