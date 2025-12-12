"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Briefcase,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

interface Application {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  candidate: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  job: {
    id: string;
    title: string;
    employer: {
      company_name: string;
    } | null;
  } | null;
}

interface ApplicationMetrics {
  total: number;
  pending: number;
  reviewing: number;
  shortlisted: number;
  rejected: number;
  hired: number;
  withdrawn: number;
  todayCount: number;
  weekCount: number;
  avgTimeToReview: number;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    reviewing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    shortlisted: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    hired: "bg-green-500/20 text-green-400 border-green-500/30",
    withdrawn: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full border ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [metrics, setMetrics] = useState<ApplicationMetrics>({
    total: 0,
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0,
    withdrawn: 0,
    todayCount: 0,
    weekCount: 0,
    avgTimeToReview: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const fetchMetrics = async () => {
    const supabase = createClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      totalResult,
      pendingResult,
      reviewingResult,
      shortlistedResult,
      rejectedResult,
      hiredResult,
      withdrawnResult,
      todayResult,
      weekResult,
    ] = await Promise.all([
      supabase.from("applications").select("id", { count: "exact", head: true }),
      supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "reviewing"),
      supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "shortlisted"),
      supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "rejected"),
      supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "hired"),
      supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "withdrawn"),
      supabase.from("applications").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
      supabase.from("applications").select("id", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
    ]);

    setMetrics({
      total: totalResult.count || 0,
      pending: pendingResult.count || 0,
      reviewing: reviewingResult.count || 0,
      shortlisted: shortlistedResult.count || 0,
      rejected: rejectedResult.count || 0,
      hired: hiredResult.count || 0,
      withdrawn: withdrawnResult.count || 0,
      todayCount: todayResult.count || 0,
      weekCount: weekResult.count || 0,
      avgTimeToReview: 0,
    });
  };

  const fetchApplications = async () => {
    const supabase = createClient();
    let query = supabase
      .from("applications")
      .select(`
        id, status, created_at, updated_at,
        candidate:candidates(id, full_name, email),
        job:jobs(id, title, employer:employers(company_name))
      `)
      .order("created_at", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data } = await query;
    setApplications((data as unknown as Application[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
    fetchApplications();

    const supabase = createClient();
    const channel = supabase
      .channel("admin-apps-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, () => {
        fetchMetrics();
        fetchApplications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [page, statusFilter]);

  const filteredApplications = applications.filter((app) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      app.candidate?.full_name?.toLowerCase().includes(search) ||
      app.candidate?.email?.toLowerCase().includes(search) ||
      app.job?.title?.toLowerCase().includes(search) ||
      app.job?.employer?.company_name?.toLowerCase().includes(search)
    );
  });

  const updateStatus = async (applicationId: string, newStatus: string) => {
    const supabase = createClient();
    await supabase.from("applications").update({ status: newStatus }).eq("id", applicationId);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 bg-gray-700 rounded"></div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Applications Management</h1>
        <p className="text-gray-400 text-sm mt-1">Monitor and manage all job applications</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{metrics.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-600/20 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-white">{metrics.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Eye className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Reviewing</p>
              <p className="text-2xl font-bold text-white">{metrics.reviewing}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Hired</p>
              <p className="text-2xl font-bold text-white">{metrics.hired}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <User className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Shortlisted</p>
              <p className="text-2xl font-bold text-white">{metrics.shortlisted}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 rounded-lg">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-white">{metrics.rejected}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <Calendar className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Today</p>
              <p className="text-2xl font-bold text-white">{metrics.todayCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">This Week</p>
              <p className="text-2xl font-bold text-white">{metrics.weekCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Candidate</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Job</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Company</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Applied</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredApplications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-800/50">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-white font-medium">{app.candidate?.full_name || "Unknown"}</p>
                    <p className="text-gray-400 text-sm">{app.candidate?.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-white">{app.job?.title || "Unknown Job"}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-300">{app.job?.employer?.company_name || "-"}</p>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value)}
                    className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredApplications.length === 0 && (
          <div className="text-center py-12 text-gray-400">No applications found</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          Showing {page * pageSize + 1} - {Math.min((page + 1) * pageSize, metrics.total)} of {metrics.total}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50 hover:bg-gray-700"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={(page + 1) * pageSize >= metrics.total}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50 hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
