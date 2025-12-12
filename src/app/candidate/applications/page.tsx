"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Building2,
  ExternalLink,
  Filter,
  ChevronDown,
} from "lucide-react";

interface Application {
  id: string;
  status: string;
  match_score: number | null;
  created_at: string;
  responded_at: string | null;
  interview_scheduled_at: string | null;
  job: {
    id: string;
    slug: string;
    title: string;
    employer: {
      company_name: string;
      company_logo_url: string | null;
    };
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending Review", color: "yellow", icon: Clock },
  reviewed: { label: "Reviewed", color: "blue", icon: FileText },
  shortlisted: { label: "Shortlisted", color: "green", icon: CheckCircle },
  interviewed: { label: "Interviewed", color: "purple", icon: Calendar },
  offered: { label: "Offer Extended", color: "green", icon: CheckCircle },
  hired: { label: "Hired", color: "green", icon: CheckCircle },
  rejected: { label: "Not Selected", color: "red", icon: XCircle },
  withdrawn: { label: "Withdrawn", color: "gray", icon: XCircle },
};

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { user } = useAuthStore();
  const supabase = createClient();

  const fetchApplications = useCallback(async () => {
    if (!user?.id) return;

    const { data: candidate } = await supabase
      .from("candidates")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!candidate) {
      setLoading(false);
      return;
    }

    let query = supabase
      .from("applications")
      .select(`
        id,
        status,
        match_score,
        created_at,
        responded_at,
        interview_scheduled_at,
        job:jobs(id, slug, title, employer:employers(company_name, company_logo_url))
      `)
      .eq("candidate_id", candidate.id)
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data } = await query;
    setApplications((data as unknown as Application[]) || []);
    setLoading(false);
  }, [user, supabase, statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig.pending;
  };

  const withdrawApplication = async (applicationId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to withdraw this application? This action cannot be undone."
    );

    if (!confirmed) return;

    await supabase
      .from("applications")
      .update({ status: "withdrawn" })
      .eq("id", applicationId);

    fetchApplications();
  };

  const groupedApplications = applications.reduce((acc, app) => {
    const status = app.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(app);
    return acc;
  }, {} as Record<string, Application[]>);

  const statusOrder = [
    "interviewed",
    "offered",
    "shortlisted",
    "reviewed",
    "pending",
    "hired",
    "rejected",
    "withdrawn",
  ];

  const sortedStatuses = Object.keys(groupedApplications).sort(
    (a, b) => statusOrder.indexOf(a) - statusOrder.indexOf(b)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-1">
            Track the status of your job applications.
          </p>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Applications</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interviewed">Interviewed</option>
            <option value="offered">Offered</option>
            <option value="hired">Hired</option>
            <option value="rejected">Not Selected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Applications</p>
          <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-indigo-600">
            {applications.filter((a) => ["pending", "reviewed", "shortlisted", "interviewed"].includes(a.status)).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Interviews</p>
          <p className="text-2xl font-bold text-purple-600">
            {applications.filter((a) => a.status === "interviewed" || a.interview_scheduled_at).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Offers</p>
          <p className="text-2xl font-bold text-green-600">
            {applications.filter((a) => ["offered", "hired"].includes(a.status)).length}
          </p>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No applications yet
          </h3>
          <p className="text-gray-500 mb-4">
            Start applying to jobs to track your applications here.
          </p>
          <Link
            href="/candidate/jobs"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Browse Jobs
          </Link>
        </div>
      ) : statusFilter === "all" ? (
        // Grouped view
        <div className="space-y-8">
          {sortedStatuses.map((status) => {
            const config = getStatusConfig(status);
            const StatusIcon = config.icon;
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-4">
                  <StatusIcon className={`h-5 w-5 text-${config.color}-500`} />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {config.label}
                  </h2>
                  <span className="text-sm text-gray-500">
                    ({groupedApplications[status].length})
                  </span>
                </div>
                <div className="space-y-3">
                  {groupedApplications[status].map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onWithdraw={withdrawApplication}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Flat view
        <div className="space-y-3">
          {applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onWithdraw={withdrawApplication}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({
  application,
  onWithdraw,
  formatDate,
}: {
  application: Application;
  onWithdraw: (id: string) => void;
  formatDate: (date: string) => string;
}) {
  const config = statusConfig[application.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {application.job.employer.company_logo_url ? (
              <img
                src={application.job.employer.company_logo_url}
                alt={application.job.employer.company_name}
                className="w-10 h-10 object-contain"
              />
            ) : (
              <Building2 className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div>
            <Link
              href={`/jobs/${application.job.slug}`}
              className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
            >
              {application.job.title}
            </Link>
            <p className="text-gray-600">{application.job.employer.company_name}</p>
            <p className="text-sm text-gray-400 mt-1">
              Applied {formatDate(application.created_at)}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-700`}
          >
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </span>
          {application.match_score && (
            <p className="text-sm text-gray-500 mt-2">
              Match: {Math.round(application.match_score * 100)}%
            </p>
          )}
        </div>
      </div>

      {application.interview_scheduled_at && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          <span className="text-purple-700">
            Interview scheduled: {formatDate(application.interview_scheduled_at)}
          </span>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <Link
          href={`/jobs/${application.job.slug}`}
          className="flex items-center gap-1 text-indigo-600 text-sm font-medium hover:text-indigo-700"
        >
          View Job <ExternalLink className="h-4 w-4" />
        </Link>
        {["pending", "reviewed"].includes(application.status) && (
          <button
            onClick={() => onWithdraw(application.id)}
            className="text-red-600 text-sm font-medium hover:text-red-700"
          >
            Withdraw
          </button>
        )}
      </div>
    </div>
  );
}
