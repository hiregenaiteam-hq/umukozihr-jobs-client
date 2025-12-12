"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import {
  Briefcase,
  Plus,
  Eye,
  Users,
  Edit,
  MoreVertical,
  Archive,
  Trash2,
  Copy,
  ExternalLink,
} from "lucide-react";

interface Job {
  id: string;
  slug: string;
  title: string;
  employment_type: string;
  work_location: string;
  status: string;
  applications_count: number;
  views_count: number;
  created_at: string;
  published_at: string | null;
  expires_at: string | null;
}

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { user } = useAuthStore();
  const supabase = createClient();

  const fetchJobs = useCallback(async () => {
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

    const { data } = await supabase
      .from("jobs")
      .select(`
        id,
        slug,
        title,
        employment_type,
        work_location,
        status,
        applications_count,
        views_count,
        created_at,
        published_at,
        expires_at
      `)
      .eq("employer_id", employer.id)
      .order("created_at", { ascending: false });

    setJobs((data as Job[]) || []);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const updateJobStatus = async (jobId: string, status: string) => {
    await supabase
      .from("jobs")
      .update({
        status,
        ...(status === "published" ? { published_at: new Date().toISOString() } : {}),
        ...(status === "closed" ? { closed_at: new Date().toISOString() } : {}),
      })
      .eq("id", jobId);

    fetchJobs();
    setActiveMenu(null);
  };

  const duplicateJob = async (job: Job) => {
    if (!user?.id) return;

    const { data: employer } = await supabase
      .from("employers")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!employer) return;

    const { data: originalJob } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", job.id)
      .single();

    if (!originalJob) return;

    const { id, slug, created_at, updated_at, published_at, closed_at, views_count, applications_count, ...jobData } = originalJob;

    await supabase.from("jobs").insert({
      ...jobData,
      title: `${jobData.title} (Copy)`,
      slug: `${slug}-copy-${Date.now()}`,
      status: "draft",
      employer_id: employer.id,
    });

    fetchJobs();
    setActiveMenu(null);
  };

  const deleteJob = async (jobId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job? This action cannot be undone."
    );

    if (!confirmed) return;

    await supabase.from("jobs").delete().eq("id", jobId);
    fetchJobs();
    setActiveMenu(null);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; bgColor: string; textColor: string }> = {
      draft: { label: "Draft", bgColor: "bg-gray-100", textColor: "text-gray-700" },
      published: { label: "Active", bgColor: "bg-green-100", textColor: "text-green-700" },
      closed: { label: "Closed", bgColor: "bg-red-100", textColor: "text-red-700" },
      filled: { label: "Filled", bgColor: "bg-blue-100", textColor: "text-blue-700" },
    };
    const { label, bgColor, textColor } = config[status] || config.draft;
    return (
      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${bgColor} ${textColor}`}>
        {label}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-600 mt-1">
            Manage your job postings and track performance.
          </p>
        </div>
        <Link
          href="/employer/jobs/new"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          <Plus className="h-5 w-5" />
          Post a New Job
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Jobs</p>
          <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {jobs.filter((j) => j.status === "published").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="text-2xl font-bold text-gray-600">
            {jobs.filter((j) => j.status === "draft").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Closed</p>
          <p className="text-2xl font-bold text-red-600">
            {jobs.filter((j) => j.status === "closed" || j.status === "filled").length}
          </p>
        </div>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No jobs posted yet
          </h3>
          <p className="text-gray-500 mb-4">
            Create your first job posting to start receiving applications.
          </p>
          <Link
            href="/employer/jobs/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            <Plus className="h-5 w-5" />
            Post Your First Job
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                    Job Title
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-500">
                    Applicants
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-500">
                    Views
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                    Created
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/employer/jobs/${job.slug}`}
                        className="font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {job.title}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {job.employment_type.replace(/_/g, " ")} • {job.work_location}
                      </p>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(job.status)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="flex items-center justify-center gap-1 text-gray-600">
                        <Users className="h-4 w-4" />
                        {job.applications_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="flex items-center justify-center gap-1 text-gray-600">
                        <Eye className="h-4 w-4" />
                        {job.views_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(job.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/employer/jobs/${job.slug}/edit`}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <a
                          href={`/jobs/${job.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="View"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === job.id ? null : job.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {activeMenu === job.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              {job.status === "draft" && (
                                <button
                                  onClick={() => updateJobStatus(job.id, "published")}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                                >
                                  <Eye className="h-4 w-4" />
                                  Publish
                                </button>
                              )}
                              {job.status === "published" && (
                                <button
                                  onClick={() => updateJobStatus(job.id, "closed")}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                                >
                                  <Archive className="h-4 w-4" />
                                  Close Job
                                </button>
                              )}
                              {job.status === "closed" && (
                                <button
                                  onClick={() => updateJobStatus(job.id, "published")}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                                >
                                  <Eye className="h-4 w-4" />
                                  Reopen
                                </button>
                              )}
                              <button
                                onClick={() => duplicateJob(job)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                              >
                                <Copy className="h-4 w-4" />
                                Duplicate
                              </button>
                              <button
                                onClick={() => deleteJob(job.id)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
