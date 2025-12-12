"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Briefcase, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.push("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">UmukoziHR Jobs</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link
                href="/jobs"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Find Jobs
              </Link>
              <Link
                href="/companies"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Companies
              </Link>
            </div>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                <Link
                  href={user.user_type === "employer" ? "/employer/dashboard" : "/candidate/dashboard"}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-4 space-y-2">
            <Link href="/jobs" className="block text-gray-600 hover:text-gray-900 py-2">
              Find Jobs
            </Link>
            <Link href="/companies" className="block text-gray-600 hover:text-gray-900 py-2">
              Companies
            </Link>
            {user ? (
              <>
                <Link
                  href={user.user_type === "employer" ? "/employer/dashboard" : "/candidate/dashboard"}
                  className="block text-gray-600 hover:text-gray-900 py-2"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block text-gray-600 hover:text-gray-900 py-2 w-full text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/signin" className="block text-gray-600 hover:text-gray-900 py-2">
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block bg-indigo-600 text-white text-center py-2 rounded-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
