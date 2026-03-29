"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowRightOnRectangleIcon, 
  UserCircleIcon, 
  ChartBarIcon, 
  HomeIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();

  const links = [
    { href: "/", label: "Home", icon: HomeIcon, show: true },
    { href: "/admin", label: "Admin Dashboard", icon: ChartBarIcon, show: user?.role === 'admin' },
  ];

  if (!user) return null; // Navbar hidden on login page if guarded correctly

  return (
    <nav className="glass sticky top-0 z-50 border-b border-sky-500/10" id="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group px-2 py-1 rounded-xl hover:bg-white/5 transition-colors" id="nav-logo">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-black text-xs tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                EP_SA
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                EASY <span className="text-emerald-400">PDF</span>_SA
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-sky-400/60 font-bold mt-1">Management System</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {links.filter(l => l.show).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-sky-200/70 hover:text-white hover:bg-sky-500/10 transition-all duration-300 group"
              >
                <link.icon className="w-5 h-5 text-sky-400/50 group-hover:text-sky-400 transition-colors" />
                {link.label}
              </Link>
            ))}

            <div className="h-6 w-px bg-sky-500/10 mx-2" />

            {/* Profile & Logout */}
            <div className="flex items-center gap-4 pl-2">
              <div className="flex flex-col items-end mr-1">
                <span className="text-xs font-bold text-white leading-none">{user.email.split('@')[0]}</span>
                <span className="text-[10px] text-sky-400/60 font-medium uppercase mt-1">{user.role}</span>
              </div>
              
              <button
                onClick={() => signOut()}
                className="p-2.5 rounded-xl text-sky-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group relative"
                title="Sign Out"
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="absolute -bottom-8 right-0 text-[10px] bg-sky-950 px-2 py-1 rounded border border-sky-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Sign Out
                </span>
              </button>
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2.5 rounded-xl text-sky-300 hover:bg-sky-500/10 transition-all active:scale-95"
            id="mobile-menu-toggle"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-sky-500/10 bg-sky-950/50 backdrop-blur-xl animate-fade-in">
          <div className="px-4 py-6 space-y-3">
            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl mb-4 border border-white/10">
              <UserCircleIcon className="w-10 h-10 text-sky-400" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white capitalize">{user.email.split('@')[0]}</span>
                <span className="text-xs text-sky-400/60 font-medium uppercase tracking-wider">{user.role}</span>
              </div>
            </div>
            
            {links.filter(l => l.show).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold text-sky-200/80 hover:text-white hover:bg-sky-500/10 transition-all group"
              >
                <link.icon className="w-6 h-6 text-sky-400/50 group-hover:text-sky-400" />
                {link.label}
              </Link>
            ))}
            
            <button
              onClick={() => {
                setMobileOpen(false);
                signOut();
              }}
              className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-base font-bold text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all mt-4 border border-red-500/10 bg-red-500/5"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
