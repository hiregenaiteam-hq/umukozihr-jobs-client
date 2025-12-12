import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building2,
  Filter,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Browse Jobs | UmukoziHR Jobs",
  description: "Find your next career opportunity. Browse job listings from top employers across Africa and beyond.",
  openGraph: {
    title: "Browse Jobs | UmukoziHR Jobs",
    description: "Find your next career opportunity. Browse job listings from top employers.",
    type: "website",
  },
};

interface Job {
  id: string;
  slug: string;
  title: string;
  employment_type: string;
  work_location: string;
  location_city: string | null;
  location_country: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  salary_visible: boolean;
  skills_required: string[] | null;
  featured: boolean;
  created_at: string;
  employer: {
    company_name: string;
    company_logo_url: string | null;
    company_slug: string | null;
  };
}

function formatSalary(job: Job) {
  if (!job.salary_visible || (!job.salary_min && !job.salary_max)) {
    return "Competitive salary";
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
}

function formatDate(date: string) {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
  return d.toLocaleDateString();
}

export default async function PublicJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

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
      employer:employers(company_name, company_logo_url, company_slug)
    `)
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (params.q) {
    query = query.ilike("title", `%${params.q}%`);
  }

  if (params.type) {
    query = query.eq("employment_type", params.type);
  }

  if (params.location) {
    query = query.eq("work_location", params.location);
  }

  const { data: jobs } = await query.limit(50);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Find Your Dream Job</h1>
            <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
              Discover opportunities from verified employers across Africa and beyond.
            </p>
          </div>

          {/* Search Form */}
          <form className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="q"
                  defaultValue={params.q}
                  placeholder="Job title, keywords, or company"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
              <select
                name="type"
                defaultValue={params.type}
                className="px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-gray-50"
              >
                <option value="">All Types</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
              <select
                name="location"
                defaultValue={params.location}
                className="px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-gray-50"
              >
                <option value="">All Locations</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-600">
            {(jobs as unknown as Job[])?.length || 0} jobs found
          </p>
          <Link
            href="/signup?type=employer"
            className="text-indigo-600 font-medium hover:text-indigo-700"
          >
            Post a job
          </Link>
        </div>

        {!jobs || jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {(jobs as unknown as Job[]).map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.slug}`}
                className={`block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition ${
                  job.featured ? "ring-2 ring-indigo-500" : ""
                }`}
              >
                {job.featured && (
                  <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded mb-3">
                    Featured
                  </span>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {job.employer.company_logo_url ? (
                      <img
                        src={job.employer.company_logo_url}
                        alt={job.employer.company_name}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 hover:text-indigo-600">
                      {job.title}
                    </h2>
                    <p className="text-gray-600">{job.employer.company_name}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location_city && job.location_country
                          ? `${job.location_city}, ${job.location_country}`
                          : job.work_location === "remote"
                          ? "Remote"
                          : "Location flexible"}
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
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.skills_required.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills_required.length > 4 && (
                          <span className="text-gray-400 text-xs py-1">
                            +{job.skills_required.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Looking to Hire?</h2>
          <p className="text-indigo-200 mb-8 max-w-2xl mx-auto">
            Post your job on UmukoziHR Jobs and reach thousands of qualified candidates.
          </p>
          <Link
            href="/signup?type=employer"
            className="inline-block bg-white text-indigo-900 px-8 py-4 rounded-lg font-semibold hover:bg-indigo-50 transition"
          >
            Post a Job for Free
          </Link>
        </div>
      </section>
    </div>
  );
}
