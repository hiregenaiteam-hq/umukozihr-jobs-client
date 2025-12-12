"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Loader2,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/employer/dashboard", icon: LayoutDashboard },
  { name: "My Jobs", href: "/employer/jobs", icon: Briefcase },
  { name: "Applicants", href: "/employer/applicants", icon: Users },
  { name: "Company Profile", href: "/employer/company", icon: Building2 },
  { name: "Settings", href: "/employer/settings", icon: Settings },
];

export default function EmployerLayout({
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
        .select("*, employers(*)")
        .eq("user_id", session.user.id)
        .single();

      if (!profile) {
        router.push("/signin");
        return;
      }

      if (profile.user_type !== "employer") {
        router.push("/candidate/dashboard");
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
        <div className="flex flex-col items-center gap-4">
          <div className="neu-raised w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse-glow">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
          <span className="text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 glass-heavy border-r border-white/10 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/umukozi-logo.png" alt="UmukoziHR" width={36} height={36} className="rounded-lg" />
            <span className="text-lg font-bold text-gradient">UmukoziHR</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Post Job Button */}
        <div className="p-4">
          <Link
            href="/employer/jobs/new"
            className="btn-primary flex items-center justify-center gap-2 w-full py-3"
          >
            <PlusCircle className="h-5 w-5" />
            Post a Job
          </Link>
        </div>

        <nav className="px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "glass border border-blue-500/30 text-white font-medium"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-400' : ''}`} />
                {item.name}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="glass p-3 rounded-xl mb-3">
            <div className="flex items-center gap-3">
              <div className="neu-raised w-10 h-10 rounded-xl flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 glass-heavy border-b border-white/10 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <Image src="/umukozi-logo.png" alt="UmukoziHR" width={28} height={28} className="rounded-lg" />
              <span className="text-lg font-semibold text-gradient">UmukoziHR</span>
            </div>
            <Link
              href="/employer/jobs/new"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <PlusCircle className="h-6 w-6" />
            </Link>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
