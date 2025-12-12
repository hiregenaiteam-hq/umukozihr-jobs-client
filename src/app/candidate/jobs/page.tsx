"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Building2,
  Filter,
  X,
} from "lucide-react";

interface Job {
  id: string;
  slug: string;
  title: string;
  employment_type: string;
  work_location: string;
  location_city: string;
  location_country: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  salary_visible: boolean;
  skills_required: string[];
  featured: boolean;
  created_at: string;
  employer: {
    company_name: string;
    company_logo_url: string | null;
  };
}

interface Filters {
  search: string;
  employment_type: string;
  work_location: string;
  experience_level: string;
}

export default function CandidateJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    employment_type: "",
    work_location: "",
    experience_level: "",
  });
  const { user } = useAuthStore();
  const supabase = createClient();

  const fetchJobs = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("jobs")
      .select(`
        id,
        slug,
        title,
        employment_type,
        work_location,
        location_city,
        location_country,
        salary_min,
        salary_max,
        salary_currency,
        salary_visible,
        skills_required,
        featured,
        created_at,
        employer:employers(company_name, company_logo_url)
      `)
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (filters.search) {
      query = query.ilike("title", `%${filters.search}%`);
    }

    if (filters.employment_type) {
      query = query.eq("employment_type", filters.employment_type);
    }

    if (filters.work_location) {
      query = query.eq("work_location", filters.work_location);
    }

    if (filters.experience_level) {
      query = query.eq("experience_level", filters.experience_level);
    }

    const { data } = await query.limit(50);

    setJobs((data as unknown as Job[]) || []);
    setLoading(false);
  }, [supabase, filters]);

  const fetchSavedJobs = useCallback(async () => {
    if (!user?.id) return;

    const { data: candidate } = await supabase
      .from("candidates")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!candidate) return;

    const { data: saved } = await supabase
      .from("saved_jobs")
      .select("job_id")
      .eq("candidate_id", candidate.id);

    if (saved) {
      setSavedJobIds(new Set(saved.map((s) => s.job_id)));
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
  }, [fetchJobs, fetchSavedJobs]);

  const toggleSaveJob = async (jobId: string) => {
    if (!user?.id) return;

    const { data: candidate } = await supabase
      .from("candidates")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!candidate) return;

    if (savedJobIds.has(jobId)) {
      await supabase
        .from("saved_jobs")
        .delete()
        .eq("candidate_id", candidate.id)
        .eq("job_id", jobId);

      setSavedJobIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    } else {
      await supabase.from("saved_jobs").insert({
        candidate_id: candidate.id,
        job_id: jobId,
      });

      setSavedJobIds((prev) => new Set([...prev, jobId]));
    }
  };

  const formatSalary = (job: Job) => {
    if (!job.salary_visible || (!job.salary_min && !job.salary_max)) {
      return "Salary not disclosed";
    }

    const currency = job.salary_currency || "USD";
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });

    if (job.salary_min && job.salary_max) {
      return `${formatter.format(job.salary_min)} - ${formatter.format(job.salary_max)}`;
    }
    if (job.salary_min) {
      return `From ${formatter.format(job.salary_min)}`;
    }
    return `Up to ${formatter.format(job.salary_max!)}`;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
    return d.toLocaleDateString();
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      employment_type: "",
      work_location: "",
      experience_level: "",
    });
  };

  const hasActiveFilters =
    filters.employment_type || filters.work_location || filters.experience_level;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Jobs</h1>
        <p className="text-gray-600 mt-1">
          Discover opportunities that match your skills and preferences.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search job titles, skills, or keywords..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition ${
              showFilters || hasActiveFilters
                ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="h-5 w-5" />
            Filters
            {hasActiveFilters && (
              <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                {[filters.employment_type, filters.work_location, filters.experience_level].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.employment_type}
                onChange={(e) =>
                  setFilters({ ...filters, employment_type: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Employment Types</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>

              <select
                value={filters.work_location}
                onChange={(e) =>
                  setFilters({ ...filters, work_location: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Work Locations</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>

              <select
                value={filters.experience_level}
                onChange={(e) =>
                  setFilters({ ...filters, experience_level: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Experience Levels</option>
                <option value="entry">Entry Level</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  <X className="h-4 w-4" />
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No jobs found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filters to find more opportunities.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"} found
          </p>

          {jobs.map((job) => (
            <div
              key={job.id}
              className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition ${
                job.featured ? "ring-2 ring-indigo-500" : ""
              }`}
            >
              {job.featured && (
                <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded mb-3">
                  Featured
                </span>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {job.employer.company_logo_url ? (
                        <img
                          src={job.employer.company_logo_url}
                          alt={job.employer.company_name}
                          className="w-10 h-10 object-contain"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                      >
                        {job.title}
                      </Link>
                      <p className="text-gray-600">{job.employer.company_name}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location_city && job.location_country
                        ? `${job.location_city}, ${job.location_country}`
                        : job.work_location === "remote"
                        ? "Remote"
                        : "Location not specified"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {job.employment_type.replace(/_/g, " ")}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatSalary(job)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDate(job.created_at)}
                    </span>
                  </div>

                  {job.skills_required && job.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {job.skills_required.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills_required.length > 5 && (
                        <span className="text-gray-400 text-xs py-1">
                          +{job.skills_required.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => toggleSaveJob(job.id)}
                  className={`p-2 rounded-lg transition ${
                    savedJobIds.has(job.id)
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-gray-100 text-gray-400 hover:text-indigo-600"
                  }`}
                  title={savedJobIds.has(job.id) ? "Unsave job" : "Save job"}
                >
                  {savedJobIds.has(job.id) ? (
                    <BookmarkCheck className="h-5 w-5" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <Link
                  href={`/jobs/${job.slug}`}
                  className="flex-1 text-center bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  View Details
                </Link>
                <Link
                  href={`/jobs/${job.slug}/apply`}
                  className="flex-1 text-center border border-indigo-600 text-indigo-600 py-2 px-4 rounded-lg font-medium hover:bg-indigo-50 transition"
                >
                  Quick Apply
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
