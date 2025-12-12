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
  const { user } = useAuthStore();
  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;

      // Get candidate profile
      const { data: candidate } = await supabase
        .from("candidates")
        .select("id, profile_completeness")
        .eq("profile_id", user.id)
        .single();

      if (!candidate) {
        setLoading(false);
        return;
      }

      // Get applications count
      const { count: applicationsCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("candidate_id", candidate.id);

      // Get saved jobs count
      const { count: savedJobsCount } = await supabase
        .from("saved_jobs")
        .select("*", { count: "exact", head: true })
        .eq("candidate_id", candidate.id);

      // Get recent applications
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
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
      case "withdrawn":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name || "there"}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s what&apos;s happening with your job search.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Applications</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.applications_count}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Saved Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.saved_jobs_count}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Profile Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.profile_views}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Profile Strength</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.profile_completeness}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completeness Alert */}
      {stats.profile_completeness < 80 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-amber-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800">
                Complete your profile
              </h3>
              <p className="text-amber-700 text-sm mt-1">
                A complete profile helps employers find you and improves your match score for job applications.
              </p>
              <Link
                href="/candidate/profile"
                className="inline-flex items-center gap-1 text-amber-800 font-medium mt-2 hover:underline"
              >
                Update Profile <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Applications */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Applications
            </h2>
            <Link
              href="/candidate/applications"
              className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
            >
              View all
            </Link>
          </div>
        </div>

        {recentApplications.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No applications yet</p>
            <Link
              href="/candidate/jobs"
              className="inline-flex items-center gap-2 mt-4 text-indigo-600 font-medium hover:text-indigo-700"
            >
              Browse Jobs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentApplications.map((application) => (
              <div
                key={application.id}
                className="p-6 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(application.status)}
                  <div>
                    <Link
                      href={`/jobs/${application.job.slug}`}
                      className="font-medium text-gray-900 hover:text-indigo-600"
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
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      application.status === "shortlisted" ||
                      application.status === "interviewed" ||
                      application.status === "offered" ||
                      application.status === "hired"
                        ? "bg-green-100 text-green-700"
                        : application.status === "rejected" ||
                          application.status === "withdrawn"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {getStatusLabel(application.status)}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
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
          className="bg-indigo-600 text-white p-6 rounded-xl hover:bg-indigo-700 transition group"
        >
          <Briefcase className="h-8 w-8 mb-4" />
          <h3 className="text-lg font-semibold">Find Jobs</h3>
          <p className="text-indigo-200 text-sm mt-1">
            Browse latest opportunities
          </p>
          <ArrowRight className="h-5 w-5 mt-4 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/candidate/profile"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition group"
        >
          <TrendingUp className="h-8 w-8 text-indigo-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">
            Improve Profile
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Boost your visibility to employers
          </p>
          <ArrowRight className="h-5 w-5 mt-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/candidate/saved"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition group"
        >
          <Briefcase className="h-8 w-8 text-purple-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Saved Jobs</h3>
          <p className="text-gray-500 text-sm mt-1">
            Review your bookmarked positions
          </p>
          <ArrowRight className="h-5 w-5 mt-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
