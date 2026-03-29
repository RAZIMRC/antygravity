"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LockClosedIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 glass rounded-3xl p-8 sm:p-12 shadow-2xl slide-up">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-sky-500/10 rounded-2xl flex items-center justify-center border border-sky-500/20 mb-6">
            <LockClosedIcon className="h-8 w-8 text-sky-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            EASY PDF_SA
          </h2>
          <p className="mt-3 text-sky-200/60 font-medium">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-center animate-shake">
              <span className="flex-1 text-center">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-300/40 group-focus-within:text-sky-400 transition-colors">
                <EnvelopeIcon className="h-5 w-5" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-12 pr-4 py-4 bg-sky-950/20 border border-sky-800/30 rounded-2xl text-white placeholder-sky-300/30 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all sm:text-sm"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-300/40 group-focus-within:text-sky-400 transition-colors">
                <LockClosedIcon className="h-5 w-5" />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-12 pr-4 py-4 bg-sky-950/20 border border-sky-800/30 rounded-2xl text-white placeholder-sky-300/30 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-sky-600 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all shadow-lg hover:shadow-sky-500/25 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <span className="text-xs text-sky-400/40 font-medium uppercase tracking-widest">
            Privacy First System
          </span>
        </div>
      </div>
    </div>
  );
}
