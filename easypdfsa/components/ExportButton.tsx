"use client";

interface ExportButtonProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
  disabled?: boolean;
}

export default function ExportButton({
  onClick,
  loading = false,
  label = "Download PDF",
  disabled = false,
}: ExportButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      id="export-button"
      className="btn-shine inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:from-sky-400 hover:to-sky-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sky-500/25 transition-all duration-300"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner" />
          Processing...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
