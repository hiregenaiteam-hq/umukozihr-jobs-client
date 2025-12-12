"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import {
  LayoutDashboard,
  Search,
  FileText,
  Bookmark,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/candidate/dashboard", icon: LayoutDashboard },
  { name: "Find Jobs", href: "/candidate/jobs", icon: Search },
  { name: "Applications", href: "/candidate/applications", icon: FileText },
  { name: "Saved Jobs", href: "/candidate/saved", icon: Bookmark },
  { name: "Tailor", href: "/candidate/tailor", icon: Sparkles },
  { name: "My Profile", href: "/candidate/profile", icon: User },
  { name: "Settings", href: "/candidate/settings", icon: Settings },
];

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, logout } = useAuthStore();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/signin?redirect=" + pathname);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*, candidates(*)")
        .eq("user_id", session.user.id)
        .single();

      if (!profile) {
        router.push("/signin");
        return;
      }

      if (profile.user_type !== "candidate") {
        router.push("/employer/dashboard");
        return;
      }

      setUser(profile);
      setLoading(false);
    };

    checkAuth();
  }, [supabase, router, pathname, setUser]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            UmukoziHR Jobs
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-700 font-semibold">
                {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-lg font-semibold text-indigo-600">
              UmukoziHR Jobs
            </span>
            <div className="w-6" />
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
