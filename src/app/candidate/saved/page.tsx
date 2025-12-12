"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import {
  Bookmark,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building2,
  Trash2,
} from "lucide-react";

interface SavedJob {
  id: string;
  notes: string | null;
  created_at: string;
  job: {
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
    status: string;
    employer: {
      company_name: string;
      company_logo_url: string | null;
    };
  };
}

export default function CandidateSavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const supabase = createClient();

  const fetchSavedJobs = useCallback(async () => {
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

    const { data } = await supabase
      .from("saved_jobs")
      .select(`
        id,
        notes,
        created_at,
        job:jobs(
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
          status,
          employer:employers(company_name, company_logo_url)
        )
      `)
      .eq("candidate_id", candidate.id)
      .order("created_at", { ascending: false });

    setSavedJobs((data as unknown as SavedJob[]) || []);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const unsaveJob = async (savedJobId: string) => {
    await supabase.from("saved_jobs").delete().eq("id", savedJobId);
    setSavedJobs((prev) => prev.filter((sj) => sj.id !== savedJobId));
  };

  const formatSalary = (job: SavedJob["job"]) => {
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
        <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
        <p className="text-gray-600 mt-1">
          Jobs you&apos;ve bookmarked for later review.
        </p>
      </div>

      {/* Jobs List */}
      {savedJobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No saved jobs yet
          </h3>
          <p className="text-gray-500 mb-4">
            Save jobs while browsing to review them later.
          </p>
          <Link
            href="/candidate/jobs"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {savedJobs.length} {savedJobs.length === 1 ? "job" : "jobs"} saved
          </p>

          {savedJobs.map((saved) => (
            <div
              key={saved.id}
              className={`bg-white rounded-xl shadow-sm p-6 ${
                saved.job.status !== "published" ? "opacity-60" : ""
              }`}
            >
              {saved.job.status !== "published" && (
                <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded mb-3">
                  This job is no longer available
                </span>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {saved.job.employer.company_logo_url ? (
                        <img
                          src={saved.job.employer.company_logo_url}
                          alt={saved.job.employer.company_name}
                          className="w-10 h-10 object-contain"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/jobs/${saved.job.slug}`}
                        className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                      >
                        {saved.job.title}
                      </Link>
                      <p className="text-gray-600">{saved.job.employer.company_name}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {saved.job.location_city && saved.job.location_country
                        ? `${saved.job.location_city}, ${saved.job.location_country}`
                        : saved.job.work_location === "remote"
                        ? "Remote"
                        : "Location not specified"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {saved.job.employment_type.replace(/_/g, " ")}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatSalary(saved.job)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Saved {formatDate(saved.created_at)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => unsaveJob(saved.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  title="Remove from saved"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              {saved.job.status === "published" && (
                <div className="flex gap-3 mt-6">
                  <Link
                    href={`/jobs/${saved.job.slug}`}
                    className="flex-1 text-center bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/jobs/${saved.job.slug}/apply`}
                    className="flex-1 text-center border border-indigo-600 text-indigo-600 py-2 px-4 rounded-lg font-medium hover:bg-indigo-50 transition"
                  >
                    Apply Now
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
