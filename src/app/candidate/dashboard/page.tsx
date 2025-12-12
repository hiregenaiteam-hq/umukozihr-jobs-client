"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import {
  Briefcase,
  FileText,
  Eye,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
  Search,
  Bookmark,
  Target,
} from "lucide-react";

interface DashboardStats {
  applications_count: number;
  saved_jobs_count: number;
  profile_views: number;
  profile_completeness: number;
}

interface RecentApplication {
  id: string;
  status: string;
  created_at: string;
  job: {
    title: string;
    slug: string;
    employer: {
      company_name: string;
    };
  };
}

export default function CandidateDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    applications_count: 0,
    saved_jobs_count: 0,
    profile_views: 0,
    profile_completeness: 0,
  });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;

      const { data: candidate } = await supabase
        .from("candidates")
        .select("id, profile_completeness")
        .eq("profile_id", user.id)
        .single();

      if (!candidate) {
        setLoading(false);
        return;
      }

      const { count: applicationsCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("candidate_id", candidate.id);

      const { count: savedJobsCount } = await supabase
        .from("saved_jobs")
        .select("*", { count: "exact", head: true })
        .eq("candidate_id", candidate.id);

      const { data: applications } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          created_at,
          job:jobs(title, slug, employer:employers(company_name))
        `)
        .eq("candidate_id", candidate.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        applications_count: applicationsCount || 0,
        saved_jobs_count: savedJobsCount || 0,
        profile_views: 0,
        profile_completeness: candidate.profile_completeness || 0,
      });

      setRecentApplications(applications as unknown as RecentApplication[] || []);
      setLoading(false);
    };

    fetchDashboardData();
  }, [user, supabase]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "shortlisted":
      case "interviewed":
      case "offered":
      case "hired":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "rejected":
      case "withdrawn":
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "shortlisted":
      case "interviewed":
      case "offered":
      case "hired":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rejected":
      case "withdrawn":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="neu-raised w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse-glow">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
          <span className="text-gray-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Welcome Header */}
      <div className="glass-card p-8">
        <div className="flex items-center gap-4">
          <div className="neu-raised w-16 h-16 rounded-2xl flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, <span className="text-gradient">{user?.first_name || "there"}!</span>
            </h1>
            <p className="text-gray-400 mt-1">
              Here&apos;s what&apos;s happening with your job search.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: FileText, label: "Applications", value: stats.applications_count, color: "purple" },
          { icon: Bookmark, label: "Saved Jobs", value: stats.saved_jobs_count, color: "blue" },
          { icon: Eye, label: "Profile Views", value: stats.profile_views, color: "cyan" },
          { icon: Target, label: "Profile Strength", value: `${stats.profile_completeness}%`, color: "green" },
        ].map((stat, index) => (
          <div 
            key={index} 
            className="glass-card p-6 group"
            style={{ animationDelay: `${0.1 * index}s` }}
          >
            <div className="flex items-center gap-4">
              <div className={`neu-raised w-14 h-14 rounded-xl flex items-center justify-center group-hover:animate-pulse-glow transition-all`}>
                <stat.icon className={`h-7 w-7 text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Completeness Alert */}
      {stats.profile_completeness < 80 && (
        <div className="glass-card p-6 border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-start gap-4">
            <div className="neu-raised w-12 h-12 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-400">
                Complete your profile
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                A complete profile helps employers find you and improves your match score for job applications.
              </p>
              <Link
                href="/candidate/profile"
                className="inline-flex items-center gap-2 text-yellow-400 font-medium mt-3 hover:text-yellow-300 transition-colors"
              >
                Update Profile <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gradient">{stats.profile_completeness}%</div>
              <div className="text-xs text-gray-500 mt-1">Complete</div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.profile_completeness}%` }}
            />
          </div>
        </div>
      )}

      {/* Recent Applications */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <FileText className="h-5 w-5 text-purple-400" />
              Recent Applications
            </h2>
            <Link
              href="/candidate/applications"
              className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {recentApplications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="neu-raised w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
            <p className="text-gray-400 mb-4">No applications yet</p>
            <Link
              href="/candidate/jobs"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentApplications.map((application, index) => (
              <div
                key={application.id}
                className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(application.status)}
                  <div>
                    <Link
                      href={`/jobs/${application.job.slug}`}
                      className="font-medium text-white hover:text-purple-400 transition-colors"
                    >
                      {application.job.title}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {application.job.employer.company_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusClasses(application.status)}`}
                  >
                    {getStatusLabel(application.status)}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/candidate/jobs"
          className="glass-card p-6 group relative overflow-hidden"
        >
          {/* Gradient top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500" />
          
          <div className="neu-raised w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:animate-pulse-glow">
            <Search className="h-7 w-7 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Find Jobs</h3>
          <p className="text-gray-400 text-sm mb-4">
            Browse latest opportunities
          </p>
          <div className="flex items-center gap-2 text-purple-400 font-medium group-hover:text-purple-300 transition-colors">
            <span>Explore</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/candidate/profile"
          className="glass-card p-6 group relative overflow-hidden"
        >
          <div className="neu-raised w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:animate-pulse-glow">
            <TrendingUp className="h-7 w-7 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Improve Profile
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Boost your visibility to employers
          </p>
          <div className="flex items-center gap-2 text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
            <span>Update</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/candidate/saved"
          className="glass-card p-6 group relative overflow-hidden"
        >
          <div className="neu-raised w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:animate-pulse-glow">
            <Bookmark className="h-7 w-7 text-cyan-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Saved Jobs</h3>
          <p className="text-gray-400 text-sm mb-4">
            Review your bookmarked positions
          </p>
          <div className="flex items-center gap-2 text-cyan-400 font-medium group-hover:text-cyan-300 transition-colors">
            <span>View saved</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
