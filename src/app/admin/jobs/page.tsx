"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Briefcase, Search, Eye, Users, Clock, CheckCircle, XCircle, MapPin } from "lucide-react";

interface Job {
  id: string;
  title: string;
  slug: string;
  status: string;
  employment_type: string;
  work_location: string;
  location_city: string | null;
  location_country: string | null;
  views_count: number;
  applications_count: number;
  created_at: string;
  employer: { company_name: string } | null;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft" | "closed">("all");

  useEffect(() => {
    const fetchJobs = async () => {
      const supabase = createClient();
      let query = supabase
        .from("jobs")
        .select("*, employer:employers(company_name)")
        .order("created_at", { ascending: false });
      
      if (status !== "all") {
        query = query.eq("status", status);
      }
      
      const { data } = await query;
      setJobs((data || []).map(j => ({
        ...j,
        employer: Array.isArray(j.employer) ? j.employer[0] : j.employer
      })));
      setLoading(false);
    };
    fetchJobs();
  }, [status]);

  const filteredJobs = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.employer?.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (s: string) => {
    switch (s) {
      case "published": return "bg-green-600/20 text-green-400";
      case "draft": return "bg-yellow-600/20 text-yellow-400";
      case "closed": return "bg-gray-600/20 text-gray-400";
      case "filled": return "bg-blue-600/20 text-blue-400";
      default: return "bg-gray-600/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Jobs</h1>
        <p className="text-gray-400 text-sm mt-1">{jobs.length} total jobs</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Job</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Company</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Views</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Apps</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 w-24 bg-gray-700 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : filteredJobs.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No jobs found</td></tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{job.title}</p>
                    <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {job.location_city || "Remote"}{job.location_country && `, ${job.location_country}`}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{job.employer?.company_name || "Unknown"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{job.views_count}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" />{job.applications_count}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{new Date(job.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
