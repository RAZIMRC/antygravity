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
  WrenchScrewdriverIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

type Profile = {
  id: string;
  email: string;
  role: string;
  display_name: string;
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
  const [mounted, setMounted] = useState(false);
  
  // Managing users
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "employee",
    displayName: ""
  });
  
  const [editData, setEditData] = useState({
    email: "",
    role: "",
    displayName: "",
    newPassword: ""
  });

  useEffect(() => {
    setMounted(true);
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return alert("Email and Password are required");
    
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        alert("Member added successfully!");
        setFormData({ email: "", password: "", role: "employee", displayName: "" });
        setShowAddForm(false);
        fetchData();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to create user");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ 
          userId, 
          email: editData.email,
          role: editData.role,
          displayName: editData.displayName,
          password: editData.newPassword 
        })
      });
      
      if (res.ok) {
        alert("User updated successfully!");
        setEditingId(null);
        fetchData();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to update user");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this member? Access and profile data will be lost permanently.")) return;
    
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ userId })
      });
      
      if (res.ok) {
        alert("Member deleted successfully!");
        fetchData();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete user");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (p: Profile) => {
    setEditingId(p.id);
    setEditData({
      email: p.email,
      role: p.role,
      displayName: p.display_name || "",
      newPassword: ""
    });
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
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-bold transition-all flex items-center gap-2"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Add Member
          </button>
          <button 
            onClick={fetchData}
            className="px-6 py-3 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 rounded-2xl text-sky-400 text-sm font-bold transition-all"
          >
            Refresh Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* User Management */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-2 px-1">
            <KeyIcon className="w-5 h-5 text-sky-400" />
            <h2 className="text-xl font-bold text-white">Member Management</h2>
          </div>

          {/* Add User Form Section */}
          {showAddForm && (
            <div className="glass rounded-3xl p-6 border border-emerald-500/30 shadow-2xl animate-fade-in relative">
              <button 
                onClick={() => setShowAddForm(false)}
                className="absolute top-4 right-4 text-sky-400/50 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <PlusCircleIcon className="w-4 h-4 text-emerald-400" />
                Add New Member
              </h3>
              <form onSubmit={handleCreateUser} className="space-y-3">
                <input 
                  type="email" 
                  placeholder="Email address"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-sky-200/20 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <input 
                  type="password" 
                  placeholder="Password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-sky-200/20 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <input 
                  type="text" 
                  placeholder="Employee Name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-sky-200/20 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                  value={formData.displayName}
                  onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                />
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="employee" className="bg-sky-950">Employee</option>
                  <option value="admin" className="bg-sky-950">Admin</option>
                </select>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50"
                >
                  Create Member Account
                </button>
              </form>
            </div>
          )}
          
          <div className="space-y-4">
            {profiles.map(p => (
              <div key={p.id} className={`glass rounded-3xl p-6 border ${editingId === p.id ? 'border-sky-500/50' : 'border-white/5'} transition-all space-y-4 shadow-xl`}>
                {editingId === p.id ? (
                  // Edit Form Mode
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Editing Member</span>
                      <button onClick={() => setEditingId(null)} className="text-sky-200/40 hover:text-white"><XMarkIcon className="w-4 h-4" /></button>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Display Name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                      value={editData.displayName}
                      onChange={e => setEditData({ ...editData, displayName: e.target.value })}
                    />
                    <input 
                      type="email" 
                      placeholder="Email"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                      value={editData.email}
                      onChange={e => setEditData({ ...editData, email: e.target.value })}
                    />
                    <input 
                      type="password" 
                      placeholder="New password (blank to keep)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                      value={editData.newPassword}
                      onChange={e => setEditData({ ...editData, newPassword: e.target.value })}
                    />
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                      value={editData.role}
                      onChange={e => setEditData({ ...editData, role: e.target.value })}
                    >
                      <option value="employee" className="bg-sky-950">Employee</option>
                      <option value="admin" className="bg-sky-950">Admin</option>
                    </select>
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => handleUpdateUser(p.id)}
                        className="flex-1 py-2 bg-sky-500 rounded-lg text-[10px] font-black text-white hover:bg-sky-400"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Display Mode
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/20">
                          <UserGroupIcon className="w-6 h-6 text-sky-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white leading-none mb-1">{p.display_name || p.email.split('@')[0]}</span>
                          <span className="text-[10px] text-sky-400/60 font-bold tracking-tight lowercase">{p.email}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${p.role === 'admin' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sky-500/20 text-sky-400'}`}>
                          {p.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button 
                        onClick={() => startEdit(p)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-sky-200/60 text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Edit
                      </button>
                      {p.email !== user?.email && (
                        <button 
                          onClick={() => handleDeleteUser(p.id)}
                          className="px-3 py-2 bg-red-500/5 hover:bg-red-500/20 border border-red-500/10 rounded-xl text-red-400/60 hover:text-red-400 transition-all"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {profiles.length < 1 && (
              <div className="p-8 border-2 border-dashed border-sky-500/20 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
                <WrenchScrewdriverIcon className="w-8 h-8 text-sky-500/40" />
                <p className="text-xs text-sky-200/40">No members found</p>
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
                          <span className="text-[10px] font-bold text-white/80">
                            {mounted ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </span>
                          <span className="text-[9px] text-sky-400/40 uppercase font-bold mt-0.5">
                            {mounted ? new Date(log.created_at).toLocaleDateString() : '--/--/----'}
                          </span>
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
