"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import {
  Users,
  Filter,
  ChevronDown,
  Star,
  Mail,
  Calendar,
  FileText,
  ExternalLink,
} from "lucide-react";

interface Application {
  id: string;
  status: string;
  match_score: number | null;
  employer_rating: number | null;
  created_at: string;
  resume_url: string | null;
  candidate: {
    id: string;
    headline: string;
    linkedin_url: string | null;
    profile: {
      first_name: string;
      last_name: string;
      email: string;
      avatar_url: string | null;
    };
  };
  job: {
    id: string;
    slug: string;
    title: string;
  };
}

const statusOptions = [
  { value: "pending", label: "Pending", color: "yellow" },
  { value: "reviewed", label: "Reviewed", color: "blue" },
  { value: "shortlisted", label: "Shortlisted", color: "green" },
  { value: "interviewed", label: "Interviewed", color: "purple" },
  { value: "offered", label: "Offered", color: "green" },
  { value: "hired", label: "Hired", color: "green" },
  { value: "rejected", label: "Rejected", color: "red" },
];

export default function EmployerApplicantsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const { user } = useAuthStore();
  const supabase = createClient();

  const fetchData = useCallback(async () => {
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

    // Get employer's jobs
    const { data: jobsData } = await supabase
      .from("jobs")
      .select("id, title")
      .eq("employer_id", employer.id);

    setJobs(jobsData || []);

    const jobIds = jobsData?.map((j) => j.id) || [];

    if (jobIds.length === 0) {
      setLoading(false);
      return;
    }

    // Build applications query
    let query = supabase
      .from("applications")
      .select(`
        id,
        status,
        match_score,
        employer_rating,
        created_at,
        resume_url,
        candidate:candidates(
          id,
          headline,
          linkedin_url,
          profile:profiles(first_name, last_name, email, avatar_url)
        ),
        job:jobs(id, slug, title)
      `)
      .in("job_id", jobIds)
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    if (jobFilter !== "all") {
      query = query.eq("job_id", jobFilter);
    }

    const { data } = await query;
    setApplications((data as unknown as Application[]) || []);
    setLoading(false);
  }, [user, supabase, statusFilter, jobFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (applicationId: string, newStatus: string) => {
    await supabase
      .from("applications")
      .update({
        status: newStatus,
        responded_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    fetchData();
  };

  const updateRating = async (applicationId: string, rating: number) => {
    await supabase
      .from("applications")
      .update({ employer_rating: rating })
      .eq("id", applicationId);

    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, employer_rating: rating } : app
      )
    );
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find((o) => o.value === status);
    if (!option) return null;

    const colorClasses: Record<string, string> = {
      yellow: "bg-yellow-100 text-yellow-700",
      blue: "bg-blue-100 text-blue-700",
      green: "bg-green-100 text-green-700",
      purple: "bg-purple-100 text-purple-700",
      red: "bg-red-100 text-red-700",
    };

    return (
      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${colorClasses[option.color]}`}>
        {option.label}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
        <p className="text-gray-600 mt-1">
          Review and manage candidates who applied to your jobs.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white pr-8"
            >
              <option value="all">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {applications.filter((a) => a.status === "pending").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Shortlisted</p>
          <p className="text-2xl font-bold text-green-600">
            {applications.filter((a) => a.status === "shortlisted").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Interviewed</p>
          <p className="text-2xl font-bold text-purple-600">
            {applications.filter((a) => a.status === "interviewed").length}
          </p>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No applicants found
          </h3>
          <p className="text-gray-500">
            {statusFilter !== "all" || jobFilter !== "all"
              ? "Try adjusting your filters."
              : "Applicants will appear here once candidates apply to your jobs."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* Candidate Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {app.candidate.profile.avatar_url ? (
                      <img
                        src={app.candidate.profile.avatar_url}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-indigo-700 font-semibold">
                        {app.candidate.profile.first_name[0]}
                        {app.candidate.profile.last_name[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {app.candidate.profile.first_name} {app.candidate.profile.last_name}
                    </h3>
                    <p className="text-gray-600 text-sm">{app.candidate.headline}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Applied for {app.job.title} • {formatDate(app.created_at)}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <a
                        href={`mailto:${app.candidate.profile.email}`}
                        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </a>
                      {app.resume_url && (
                        <a
                          href={app.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          <FileText className="h-4 w-4" />
                          Resume
                        </a>
                      )}
                      {app.candidate.linkedin_url && (
                        <a
                          href={app.candidate.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Match Score & Rating */}
                <div className="flex flex-col items-end gap-3">
                  {app.match_score && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Match Score</p>
                      <p className="text-lg font-bold text-indigo-600">
                        {Math.round(app.match_score * 100)}%
                      </p>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => updateRating(app.id, star)}
                        className={`p-1 ${
                          app.employer_rating && app.employer_rating >= star
                            ? "text-yellow-500"
                            : "text-gray-300 hover:text-yellow-400"
                        }`}
                      >
                        <Star className="h-5 w-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">Status:</span>
                {getStatusBadge(app.status)}
                <div className="flex-1" />
                <select
                  value={app.status}
                  onChange={(e) => updateStatus(app.id, e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      Move to {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
