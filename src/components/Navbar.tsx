"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User, LogOut, Menu, X, ChevronRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.push("/");
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'glass-heavy py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Image
                src="/umukozi-logo.png"
                alt="UmukoziHR"
                width={40}
                height={40}
                className="rounded-xl transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight">UmukoziHR</span>
              <span className="text-xs text-purple-400 -mt-1 font-medium">Jobs</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/jobs"
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-all duration-300"
            >
              Find Jobs
            </Link>
            <Link
              href="/companies"
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-all duration-300"
            >
              Companies
            </Link>
            <a
              href="https://umukozihr-tailor.onrender.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-all duration-300 flex items-center gap-1.5"
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              Resume Tailor
            </a>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href={user.user_type === "employer" ? "/employer/dashboard" : "/candidate/dashboard"}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="group relative px-5 py-2.5 text-sm font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 animate-gradient" style={{ backgroundSize: '200% 200%' }} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400" />
                  <span className="relative flex items-center gap-1.5">
                    Get Started
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-heavy border-t border-white/5 animate-fade-in">
          <div className="px-6 py-6 space-y-2">
            <Link
              href="/jobs"
              className="block px-4 py-3 text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Jobs
            </Link>
            <Link
              href="/companies"
              className="block px-4 py-3 text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Companies
            </Link>
            <a
              href="https://umukozihr-tailor.onrender.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-all"
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              Resume Tailor
            </a>
            <div className="pt-4 border-t border-white/5">
              {user ? (
                <>
                  <Link
                    href={user.user_type === "employer" ? "/employer/dashboard" : "/candidate/dashboard"}
                    className="block px-4 py-3 text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="block px-4 py-3 text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block mt-2 px-4 py-3 text-center text-white font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
