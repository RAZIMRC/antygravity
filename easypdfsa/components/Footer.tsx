export default function Footer() {
  return (
    <footer className="border-t border-sky-500/10 mt-auto" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-sky-400 flex items-center justify-center">
              <span className="text-black font-bold text-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>
                EP
              </span>
            </div>
            <span className="text-sm font-semibold text-sky-200/60" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Easy<span className="text-sky-400/60">PDF</span>SA
            </span>
          </div>

          <p className="text-xs text-sky-300/40 text-center">
            100% client-side PDF processing. No files are uploaded to any server. Built with ❤️ for privacy.
          </p>

          <p className="text-xs text-sky-300/30">
            © {new Date().getFullYear()} EasyPDFSA
          </p>
        </div>
      </div>
    </footer>
  );
}
