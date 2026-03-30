"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ClockIcon,
  DocumentIcon,
  WrenchScrewdriverIcon
} from "@heroicons/react/24/outline";

type Profile = {
  id: string;
  email: string;
  role: string;
  password?: string;
};

type ActivityLog = {
  id: string;
  username: string;
  original_filename: string;
  export_filename: string;
  device_type: string;
  created_at: string;
};

export default function AdminPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logSearch, setLogSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, lRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("activity_logs").select("*").order("created_at", { ascending: false })
      ]);

      if (pRes.data) setProfiles(pRes.data);
      if (lRes.data) setLogs(lRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const runSeeding = async () => {
    if (!confirm("Are you sure you want to initialize the 5-user system (1 Admin, 4 Employees)? This will not delete existing users.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/setup-system", { method: "POST" });
      if (res.ok) {
        alert("System initialized successfully!");
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!newPassword) return alert("Please enter a new password");
    
    setResettingId(userId);
    try {
      const res = await fetch("/api/admin/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword })
      });
      
      if (res.ok) {
        alert("Password updated successfully!");
        setNewPassword("");
        setResettingId(null);
        fetchData(); // Refresh to see updated password in profile table
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to update password");
      }
    } catch (err: any) {
      alert(err.message);
      setResettingId(null);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8 glass rounded-3xl max-w-sm border border-red-500/20">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <KeyIcon className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-sky-200/60 text-sm">You do not have administrative privileges to view this page.</p>
        </div>
      </div>
    );
  }

  const filteredLogs = logs.filter(log => 
    log.username.toLowerCase().includes(logSearch.toLowerCase()) ||
    log.original_filename.toLowerCase().includes(logSearch.toLowerCase())
  );

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-sky-500/20 rounded-2xl border border-sky-500/30">
            <UserGroupIcon className="w-8 h-8 text-sky-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-sky-200/60 font-medium">Manage users and monitor system activity</p>
          </div>
        </div>
        <button 
          onClick={fetchData}
          className="px-6 py-3 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 rounded-2xl text-sky-400 text-sm font-bold transition-all active:scale-95"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* User Management */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-2 px-1">
            <KeyIcon className="w-5 h-5 text-sky-400" />
            <h2 className="text-xl font-bold text-white">User Management</h2>
          </div>
          
          <div className="space-y-4">
            {profiles.map(p => (
              <div key={p.id} className="glass rounded-3xl p-6 border border-white/5 space-y-4 shadow-xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/20">
                      <UserGroupIcon className="w-6 h-6 text-sky-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white leading-none mb-1">{p.email.split('@')[0]}</span>
                      <span className="text-[10px] text-sky-400/60 font-bold uppercase tracking-widest">{p.role === 'admin' ? 'SYSTEM ADMIN' : 'EMPLOYEE'}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${p.role === 'admin' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sky-500/20 text-sky-400'}`}>
                    {p.role}
                  </span>
                </div>

                {/* Password Reference Display */}
                <div className="bg-sky-500/5 rounded-xl p-3 border border-sky-500/10 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-sky-400/60 uppercase tracking-widest">Active Password</span>
                    <span className="text-xs font-mono text-sky-200 mt-1">
                      {showPasswords[p.id] ? (p.password || "No reference") : "••••••••••••"}
                    </span>
                  </div>
                  <button 
                    onClick={() => togglePassword(p.id)}
                    className="p-1.5 hover:bg-sky-500/10 rounded-lg transition-colors text-sky-400"
                  >
                    <ClockIcon className="w-4 h-4" />
                  </button>
                </div>
                
                {p.email !== user?.email && (
                  <div className="pt-2">
                    <div className="relative group">
                      <input 
                        type="password" 
                        placeholder="Change password..."
                        className="w-full bg-black/10 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-sky-200/20 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setResettingId(p.id);
                        }}
                        disabled={resettingId === p.id && loading}
                      />
                      <button 
                        onClick={() => handleResetPassword(p.id)}
                        disabled={loading || resettingId !== p.id || !newPassword}
                        className="absolute right-2 top-2 px-3 py-1 bg-sky-500 rounded-lg text-[10px] font-black text-white hover:bg-sky-400 transition-colors disabled:opacity-30"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {profiles.length < 5 && (
              <div className="p-8 border-2 border-dashed border-sky-500/20 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
                <WrenchScrewdriverIcon className="w-8 h-8 text-sky-500/40" />
                <p className="text-xs text-sky-200/40">Missing member accounts?</p>
                <button 
                  onClick={runSeeding}
                  className="px-6 py-2 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/20 rounded-xl text-sky-300 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Seed 5-User System
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <ClipboardDocumentListIcon className="w-5 h-5 text-sky-400" />
              <h2 className="text-xl font-bold text-white">Activity Log</h2>
            </div>
            
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-sky-400/40" />
              <input 
                type="text" 
                placeholder="Search logs..."
                className="bg-sky-950/30 border border-sky-500/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-sky-400/30 focus:outline-none focus:ring-1 focus:ring-sky-400/50 w-64"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="glass rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-sky-500/5 border-b border-sky-500/10">
                    <th className="px-6 py-4 text-[10px] font-black text-sky-400/60 uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-[10px] font-black text-sky-400/60 uppercase tracking-widest">Files</th>
                    <th className="px-6 py-4 text-[10px] font-black text-sky-400/60 uppercase tracking-widest text-center">Device</th>
                    <th className="px-6 py-4 text-[10px] font-black text-sky-400/60 uppercase tracking-widest text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-white/2 transition-colors group">
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-white block">{log.username}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <DocumentIcon className="w-3.5 h-3.5 text-sky-400/40" />
                            <span className="text-xs text-sky-200/70 truncate max-w-[200px]">{log.original_filename}</span>
                          </div>
                          <div className="flex items-center gap-2 pl-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50" />
                            <span className="text-[10px] font-medium text-emerald-400/60">{log.export_filename}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          {log.device_type === 'iOS' ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10" title="iOS/Mobile">
                              <DevicePhoneMobileIcon className="w-3.5 h-3.5 text-sky-400" />
                              <span className="text-[10px] font-bold text-sky-400">Mobile</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10" title="Desktop">
                              <ComputerDesktopIcon className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[10px] font-bold text-emerald-400">Desktop</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold text-white/80">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-[9px] text-sky-400/40 uppercase font-bold mt-0.5">{new Date(log.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center opacity-20">
                          <MagnifyingGlassIcon className="w-10 h-10 mb-2" />
                          <p className="text-sm font-medium">No activity records found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
