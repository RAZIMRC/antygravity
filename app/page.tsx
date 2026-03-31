"use client";

import { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import UploadZone from "@/components/UploadZone";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { 
  ArrowPathIcon, 
  CheckCircleIcon, 
  ArrowDownTrayIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [fileData, setFileData] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [systemInitStatus, setSystemInitStatus] = useState<'idle' | 'loading' | 'done' | 'hidden'>('idle');

  // Check if system is already initialized
  useEffect(() => {
    if (user?.role === 'admin') {
      const checkInit = async () => {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (!error && count && count > 1) {
          setSystemInitStatus('hidden');
        }
      };
      checkInit();
    }
  }, [user]);

  // Guard: Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      // Handled by the layout/context usually, but good to have here
    }
  }, [user, authLoading]);

  const logActivity = async (originalName: string, exportName: string) => {
    if (!user) return;
    
    const ua = navigator.userAgent;
    let deviceType = 'Desktop';
    if (/iPhone|iPad|iPod/i.test(ua)) deviceType = 'iOS/iPhone';
    else if (/Android/i.test(ua)) deviceType = 'Android';

    try {
      await fetch('/api/log-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.email.split('@')[0],
          originalFilename: originalName,
          exportFilename: exportName,
          deviceType
        })
      });
    } catch (err) {
      console.error("Log failed", err);
    }
  };

  const initializeSystem = async () => {
    if (!confirm("This will create the 5-user management system (1 Admin, 4 Employees). Proceed?")) return;
    setSystemInitStatus('loading');
    try {
      const res = await fetch("/api/admin/setup-system", { method: "POST" });
      if (res.ok) {
        alert("System Setup Complete! You can now manage users in the Admin Dashboard.");
        setSystemInitStatus('done');
      } else {
        const err = await res.json();
        alert(err.error || "Setup failed");
        setSystemInitStatus('idle');
      }
    } catch (err) {
      alert("Network error during setup");
      setSystemInitStatus('idle');
    }
  };

  const handleFileSelected = async (selectedFiles: File[]) => {
    const file = selectedFiles[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const pdf = await PDFDocument.load(data, { ignoreEncryption: true });

      // Auto-embed letterhead (Top of first page)
      try {
        const headerRes = await fetch('/letterhead.jpg');
        if (headerRes.ok) {
          const headerBytes = await headerRes.arrayBuffer();
          const headerImg = await pdf.embedJpg(new Uint8Array(headerBytes));
          const firstPage = pdf.getPage(0);
          const { width: pw, height: ph } = firstPage.getSize();
          
          const headerAspect = headerImg.width / headerImg.height;
          const headerW = pw;
          const headerH = pw / headerAspect;
          
          firstPage.drawImage(headerImg, {
            x: 0,
            y: ph - headerH,
            width: headerW,
            height: headerH,
          });
        }
      } catch (err) { console.warn("Header failed", err); }

      // Auto-embed footer (Bottom of last page)
      try {
        const footerRes = await fetch('/footer.jpg');
        if (footerRes.ok) {
          const footerBytes = await footerRes.arrayBuffer();
          const footerImg = await pdf.embedJpg(new Uint8Array(footerBytes));
          const lastPage = pdf.getPage(pdf.getPageCount() - 1);
          const { width: pw } = lastPage.getSize();
          
          const footerAspect = footerImg.width / footerImg.height;
          const footerW = pw;
          const footerH = pw / footerAspect;
          
          lastPage.drawImage(footerImg, {
            x: 0,
            y: 0,
            width: footerW,
            height: footerH,
          });
        }
      } catch (err) { console.warn("Footer failed", err); }

      const pdfBytes = await pdf.save();
      const previewBlob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const pUrl = URL.createObjectURL(previewBlob);
      const downloadBlob = new Blob([pdfBytes as BlobPart], { type: "application/octet-stream" });
      const dUrl = URL.createObjectURL(downloadBlob);
      
      setFileData(previewBlob);
      setPreviewUrl(pUrl);
      setDownloadUrl(dUrl);
      setFileName(file.name);
    } catch {
      alert("Could not read this PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!downloadUrl) return;

    const baseName = fileName ? fileName.replace(/\.[^/.]+$/, "") : "Document";
    const finalName = `${baseName} (1).pdf`;
    
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = finalName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    
    // Log the success
    logActivity(fileName, finalName);

    setTimeout(() => {
      document.body.removeChild(a);
    }, 500);
  };

  const reset = () => {
    setFileData(null);
    setFileName("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setPreviewUrl(null);
    setDownloadUrl(null);
  };

  // Optimization: Only show spinner if we have NO user AND are loading
  if (authLoading && !user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 slide-up">
          <div className="w-20 h-20 bg-sky-500/10 rounded-3xl flex items-center justify-center mx-auto border border-sky-500/20">
            <ShieldCheckIcon className="w-10 h-10 text-sky-400" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Secure Access Required</h1>
          <p className="text-sky-200/60 text-lg">Please sign in to your corporate account to use the PDF branding system.</p>
          <a href="/login" className="inline-block px-8 py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-sky-600/20">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {!fileData ? (
        <div className="w-full max-w-2xl text-center py-10 z-10">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase font-black tracking-widest mb-4 slide-up">
              <CheckCircleIcon className="w-4 h-4" />
              Authenticated Session
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white slide-up" style={{ fontFamily: "'Outfit', sans-serif" }}>
              EASY PDF_SA
            </h1>
            <p className="mt-4 text-xl text-sky-200/60 max-w-xl mx-auto slide-up slide-up-delay-1">
              Welcome back, <span className="text-white font-bold">{user.email.split('@')[0]}</span>. Your file branding tool is ready.
            </p>
          </div>
          
          <div className="slide-up slide-up-delay-2">
            {loading ? (
              <div className="glass rounded-3xl p-12 text-center animate-pulse border border-sky-500/30">
                <ArrowPathIcon className="w-12 h-12 text-sky-400 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-bold text-sky-100">Processing Document...</h3>
                <p className="text-sm text-sky-300/60 mt-2">Applying custom branding</p>
              </div>
            ) : (
              <UploadZone onFilesSelected={handleFileSelected} label="Select PDF to brand" sublabel="Unlimited secure branding" />
            )}
          </div>

          {/* Admin Setup Warning (One-time) */}
          {user.role === 'admin' && systemInitStatus === 'idle' && (
            <div className="mt-12 p-6 glass rounded-3xl border border-sky-500/20 bg-sky-500/5 slide-up slide-up-delay-3 flex flex-col items-center">
              <WrenchScrewdriverIcon className="w-8 h-8 text-sky-400 mb-3" />
              <h4 className="text-sm font-bold text-white mb-2 tracking-tight">System Initialization Required</h4>
              <p className="text-xs text-sky-200/60 mb-4 max-w-sm">Configure your Supabase database and seed the employee accounts to activate the management system.</p>
              <button 
                onClick={initializeSystem}
                className="px-6 py-2.5 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 text-sky-300 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                Complete Setup
              </button>
            </div>
          )}
        </div>
      ) : (
        <section className="flex-1 flex flex-col w-full max-w-6xl mx-auto py-4 z-10">
          <div className="glass rounded-3xl p-5 mb-4 flex flex-col sm:flex-row items-center justify-between border border-emerald-500/30 bg-emerald-500/5 slide-up shrink-0 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                <CheckCircleIcon className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-white tracking-tight leading-none">Export Ready</h2>
                <p className="text-xs text-emerald-200/70 mt-1.5 line-clamp-1">Branded: <span className="text-emerald-300 font-bold">{fileName}</span></p>
              </div>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <button onClick={reset} className="flex-1 sm:flex-none px-6 py-3 rounded-2xl border border-sky-500/20 text-sky-200 font-bold text-xs hover:bg-sky-500/10 transition-all uppercase tracking-widest">
                Discard
              </button>
              <button onClick={handleExport} className="flex-1 sm:flex-none px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs shadow-xl shadow-emerald-500/20 hover:shadow-emerald-400/40 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 uppercase tracking-widest">
                <ArrowDownTrayIcon className="w-5 h-5 stroke-[3]" />
                Export
              </button>
            </div>
          </div>

          <div className="flex-1 w-full rounded-3xl overflow-hidden glass border border-sky-500/10 slide-up slide-up-delay-1 min-h-[500px] shadow-2xl">
            <iframe src={`${previewUrl}#toolbar=0`} className="w-full h-full bg-white block" title="PDF Preview" />
          </div>
        </section>
      )}
    </div>
  );
}
