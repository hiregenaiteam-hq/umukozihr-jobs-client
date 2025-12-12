"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Activity,
  Settings,
  LogOut,
  Shield,
  TrendingUp,
  Building,
  UserCheck,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Talent Metrics", href: "/admin/talent", icon: Users },
  { name: "Recruit Metrics", href: "/admin/recruit", icon: Building },
  { name: "System Health", href: "/admin/system", icon: Activity },
  { name: "Users", href: "/admin/users", icon: UserCheck },
  { name: "Jobs", href: "/admin/jobs", icon: Briefcase },
  { name: "Applications", href: "/admin/applications", icon: FileText },
  { name: "Analytics", href: "/admin/analytics", icon: TrendingUp },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/signin");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("user_id", user.id)
        .single();

      if (!profile || profile.user_type !== "admin") {
        router.replace("/");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdmin();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/signin");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Shield className="h-12 w-12 text-purple-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-gray-950 border-r border-gray-800">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <Shield className="h-8 w-8 text-purple-500" />
          <span className="ml-2 font-bold text-white">Admin Console</span>
        </div>

        <nav className="mt-6 px-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
