"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import {
  Briefcase,
  Users,
  Eye,
  TrendingUp,
  ArrowRight,
  Clock,
  PlusCircle,
  Loader2,
  Sparkles,
  Building2,
  Target,
  Zap,
} from "lucide-react";

interface DashboardStats {
  active_jobs: number;
  total_applications: number;
  new_applications: number;
  total_views: number;
}

interface RecentJob {
  id: string;
  slug: string;
  title: string;
  status: string;
  applications_count: number;
  views_count: number;
  created_at: string;
}

interface RecentApplication {
  id: string;
  status: string;
  created_at: string;
  candidate: {
    headline: string;
    profile: {
      first_name: string;
      last_name: string;
    };
  };
  job: {
    title: string;
    slug: string;
  };
}

export default function EmployerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    active_jobs: 0,
    total_applications: 0,
    new_applications: 0,
    total_views: 0,
  });
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;

    const { data: employer } = await supabase
      .from("employers")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!employer) {
      setLoading(false);
      return;
    }

    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, slug, title, status, applications_count, views_count, created_at")
      .eq("employer_id", employer.id)
      .order("created_at", { ascending: false });

    const activeJobs = jobs?.filter((j) => j.status === "published").length || 0;
    const totalViews = jobs?.reduce((sum, j) => sum + (j.views_count || 0), 0) || 0;

    const jobIds = jobs?.map((j) => j.id) || [];

    let totalApplications = 0;
    let newApplications = 0;
    let applications: RecentApplication[] = [];

    if (jobIds.length > 0) {
      const { count: appCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .in("job_id", jobIds);

      totalApplications = appCount || 0;

      const { count: newAppCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .in("job_id", jobIds)
        .eq("status", "pending");

      newApplications = newAppCount || 0;

      const { data: appData } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          created_at,
          candidate:candidates(
            headline,
            profile:profiles(first_name, last_name)
          ),
          job:jobs(title, slug)
        `)
        .in("job_id", jobIds)
        .order("created_at", { ascending: false })
        .limit(5);

      applications = (appData as unknown as RecentApplication[]) || [];
    }

    setStats({
      active_jobs: activeJobs,
      total_applications: totalApplications,
      new_applications: newApplications,
      total_views: totalViews,
    });

    setRecentJobs((jobs as RecentJob[])?.slice(0, 5) || []);
    setRecentApplications(applications);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; classes: string }> = {
      draft: { label: "Draft", classes: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
      published: { label: "Active", classes: "bg-green-500/20 text-green-400 border-green-500/30" },
      closed: { label: "Closed", classes: "bg-red-500/20 text-red-400 border-red-500/30" },
      filled: { label: "Filled", classes: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    };
    const { label, classes } = config[status] || config.draft;
    return (
      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium border ${classes}`}>
        {label}
      </span>
    );
  };

  const getApplicationStatusClasses = (status: string) => {
    if (status === "pending") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    if (status === "shortlisted") return "bg-green-500/20 text-green-400 border-green-500/30";
    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="glass-card p-8 flex-1">
          <div className="flex items-center gap-4">
            <div className="neu-raised w-16 h-16 rounded-2xl flex items-center justify-center">
              <Building2 className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Employer <span className="text-gradient">Dashboard</span>
              </h1>
              <p className="text-gray-400 mt-1">
                Manage your job postings and review applicants.
              </p>
            </div>
          </div>
        </div>
        <Link
          href="/employer/jobs/new"
          className="btn-primary flex items-center justify-center gap-3 text-lg py-4 px-8"
        >
          <PlusCircle className="h-5 w-5" />
          Post a New Job
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Briefcase, label: "Active Jobs", value: stats.active_jobs, color: "purple" },
          { icon: Users, label: "Total Applications", value: stats.total_applications, color: "blue" },
          { icon: Clock, label: "New Applications", value: stats.new_applications, color: "green", highlight: stats.new_applications > 0 },
          { icon: Eye, label: "Total Views", value: stats.total_views, color: "cyan" },
        ].map((stat, index) => (
          <div 
            key={index} 
            className={`glass-card p-6 group ${stat.highlight ? 'border-green-500/30 animate-pulse-glow' : ''}`}
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

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Jobs */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-purple-400" />
                Recent Job Postings
              </h2>
              <Link
                href="/employer/jobs"
                className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {recentJobs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="neu-raised w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-gray-400 mb-4">No job postings yet</p>
              <Link
                href="/employer/jobs/new"
                className="btn-primary inline-flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Post your first job
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentJobs.map((job, index) => (
                <Link
                  key={job.id}
                  href={`/employer/jobs/${job.slug}`}
                  className="block p-6 hover:bg-white/5 transition-colors group"
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-white group-hover:text-purple-400 transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.applications_count} applicants
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {job.views_count} views
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-400" />
                Recent Applications
              </h2>
              <Link
                href="/employer/applicants"
                className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {recentApplications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="neu-raised w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-gray-400">No applications yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Applications will appear here once candidates apply
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentApplications.map((app, index) => (
                <Link
                  key={app.id}
                  href={`/employer/applicants/${app.id}`}
                  className="block p-6 hover:bg-white/5 transition-colors group"
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                        {app.candidate.profile.first_name} {app.candidate.profile.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">{app.candidate.headline}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Applied for <span className="text-gray-400">{app.job.title}</span>
                      </p>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-lg text-xs font-medium border ${getApplicationStatusClasses(app.status)}`}
                    >
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/employer/jobs/new"
          className="glass-card p-6 group relative overflow-hidden"
        >
          {/* Gradient top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500" />
          
          <div className="neu-raised w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:animate-pulse-glow">
            <PlusCircle className="h-7 w-7 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Post a Job</h3>
          <p className="text-gray-400 text-sm mb-4">
            Create a new job posting
          </p>
          <div className="flex items-center gap-2 text-purple-400 font-medium group-hover:text-purple-300 transition-colors">
            <span>Create</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/employer/applicants"
          className="glass-card p-6 group relative overflow-hidden"
        >
          <div className="neu-raised w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:animate-pulse-glow">
            <Users className="h-7 w-7 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Review Applicants
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            {stats.new_applications} new applications to review
          </p>
          <div className="flex items-center gap-2 text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
            <span>Review</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/employer/company"
          className="glass-card p-6 group relative overflow-hidden"
        >
          <div className="neu-raised w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:animate-pulse-glow">
            <TrendingUp className="h-7 w-7 text-cyan-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Company Profile
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Attract more candidates
          </p>
          <div className="flex items-center gap-2 text-cyan-400 font-medium group-hover:text-cyan-300 transition-colors">
            <span>Update</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
