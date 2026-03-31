'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to our SEMS system (via a client-side log endpoint or similar)
    // For now, we'll just log to console, but we could call a /api/log-error route
    console.error('SEMS Frontend Captured Error:', error);
    
    const logError = async () => {
      try {
        await fetch('/api/admin/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            url: window.location.href,
            context: { digest: error.digest }
          })
        });
      } catch (e) {
        console.error('Failed to log frontend error to SEMS:', e);
      }
    };
    
    logError();
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="max-w-md w-full space-y-8 text-center bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        <div className="animate-pulse flex justify-center">
          <div className="rounded-full bg-red-500/20 p-4">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        
        <h2 className="mt-6 text-3xl font-extrabold tracking-tight">Something went wrong</h2>
        <p className="mt-2 text-sm text-gray-400">
          An unexpected error has occurred. Our automatic handle fixer has been notified and is investigating.
        </p>
        
        <div className="mt-8 flex flex-col gap-4">
          <button
            onClick={() => reset()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-95"
          >
            Try again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full flex justify-center py-3 px-4 border border-gray-600 rounded-xl shadow-sm text-sm font-bold text-gray-300 bg-transparent hover:bg-gray-700 transition-all"
          >
            Go to Homepage
          </button>
        </div>

        {error.digest && (
          <p className="mt-4 text-[10px] text-gray-600 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
