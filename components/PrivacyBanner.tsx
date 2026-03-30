"use client";

import { useState } from "react";

export default function PrivacyBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="bg-sky-900/30 border-b border-sky-500/10 slide-up"
      id="privacy-banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </span>
          <p className="text-xs sm:text-sm text-sky-200/80 truncate">
            <span className="font-semibold text-emerald-400">Privacy First</span>
            {" — "}Your files never leave your device. All processing happens locally in your browser.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1 rounded-md text-sky-400/50 hover:text-sky-300 hover:bg-sky-500/10 transition-colors"
          aria-label="Dismiss privacy banner"
          id="dismiss-privacy-banner"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
