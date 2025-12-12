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
  CheckCircle,
  PlusCircle,
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
  const { user } = useAuthStore();
  const supabase = createClient();

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;

    // Get employer profile
    const { data: employer } = await supabase
      .from("employers")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!employer) {
      setLoading(false);
      return;
    }

    // Get jobs stats
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, slug, title, status, applications_count, views_count, created_at")
      .eq("employer_id", employer.id)
      .order("created_at", { ascending: false });

    const activeJobs = jobs?.filter((j) => j.status === "published").length || 0;
    const totalViews = jobs?.reduce((sum, j) => sum + (j.views_count || 0), 0) || 0;

    // Get job IDs for applications query
    const jobIds = jobs?.map((j) => j.id) || [];

    let totalApplications = 0;
    let newApplications = 0;
    let applications: RecentApplication[] = [];

    if (jobIds.length > 0) {
      // Get applications count
      const { count: appCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .in("job_id", jobIds);

      totalApplications = appCount || 0;

      // Get new applications (pending)
      const { count: newAppCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .in("job_id", jobIds)
        .eq("status", "pending");

      newApplications = newAppCount || 0;

      // Get recent applications
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
    const config: Record<string, { label: string; color: string }> = {
      draft: { label: "Draft", color: "gray" },
      published: { label: "Active", color: "green" },
      closed: { label: "Closed", color: "red" },
      filled: { label: "Filled", color: "blue" },
    };
    const { label, color } = config[status] || config.draft;
    return (
      <span className={`inline-block px-2 py-1 rounded text-xs font-medium bg-${color}-100 text-${color}-700`}>
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Employer Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your job postings and review applicants.
          </p>
        </div>
        <Link
          href="/employer/jobs/new"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          <PlusCircle className="h-5 w-5" />
          Post a New Job
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Briefcase className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.active_jobs}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.total_applications}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">New Applications</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.new_applications}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.total_views}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Jobs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Job Postings
              </h2>
              <Link
                href="/employer/jobs"
                className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
              >
                View all
              </Link>
            </div>
          </div>

          {recentJobs.length === 0 ? (
            <div className="p-6 text-center">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No job postings yet</p>
              <Link
                href="/employer/jobs/new"
                className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700"
              >
                <PlusCircle className="h-4 w-4" />
                Post your first job
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/employer/jobs/${job.slug}`}
                  className="block p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{job.title}</h3>
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
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Applications
              </h2>
              <Link
                href="/employer/applicants"
                className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
              >
                View all
              </Link>
            </div>
          </div>

          {recentApplications.length === 0 ? (
            <div className="p-6 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No applications yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Applications will appear here once candidates apply
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentApplications.map((app) => (
                <Link
                  key={app.id}
                  href={`/employer/applicants/${app.id}`}
                  className="block p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {app.candidate.profile.first_name} {app.candidate.profile.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">{app.candidate.headline}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Applied for {app.job.title}
                      </p>
                    </div>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        app.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : app.status === "shortlisted"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
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
          className="bg-indigo-600 text-white p-6 rounded-xl hover:bg-indigo-700 transition group"
        >
          <PlusCircle className="h-8 w-8 mb-4" />
          <h3 className="text-lg font-semibold">Post a Job</h3>
          <p className="text-indigo-200 text-sm mt-1">
            Create a new job posting
          </p>
          <ArrowRight className="h-5 w-5 mt-4 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/employer/applicants"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition group"
        >
          <Users className="h-8 w-8 text-purple-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">
            Review Applicants
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            {stats.new_applications} new applications to review
          </p>
          <ArrowRight className="h-5 w-5 mt-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/employer/company"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition group"
        >
          <TrendingUp className="h-8 w-8 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">
            Company Profile
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Attract more candidates
          </p>
          <ArrowRight className="h-5 w-5 mt-4 text-green-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
