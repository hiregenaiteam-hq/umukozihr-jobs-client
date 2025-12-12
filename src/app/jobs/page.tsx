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
  Sparkles,
  ArrowRight,
  Globe,
  Target,
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-20 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="container-glass relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-300">AI-Powered Job Matching</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Find Your <span className="text-gradient">Dream Job</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Discover opportunities from verified employers across Africa and beyond.
            </p>
          </div>

          {/* Search Form */}
          <form className="max-w-4xl mx-auto">
            <div className="glass-card p-3 flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  name="q"
                  defaultValue={params.q}
                  placeholder="Job title, keywords, or company"
                  className="input-glass pl-12"
                />
              </div>
              <select
                name="type"
                defaultValue={params.type}
                className="input-glass appearance-none cursor-pointer"
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
                className="input-glass appearance-none cursor-pointer"
              >
                <option value="">All Locations</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
              <button
                type="submit"
                className="btn-primary flex items-center justify-center gap-2 min-w-[140px]"
              >
                <Search className="h-5 w-5" />
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="container-glass py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="neu-raised w-10 h-10 rounded-xl flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-gray-400">
              <span className="text-white font-semibold">{(jobs as unknown as Job[])?.length || 0}</span> jobs found
            </p>
          </div>
          <Link
            href="/signup?type=employer"
            className="btn-glass flex items-center gap-2 text-sm"
          >
            <Target className="h-4 w-4" />
            Post a job
          </Link>
        </div>

        {!jobs || jobs.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <div className="neu-raised w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Briefcase className="h-10 w-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              No jobs found
            </h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search criteria or check back later.
            </p>
            <Link href="/jobs" className="btn-primary inline-flex items-center gap-2">
              <Search className="h-4 w-4" />
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {(jobs as unknown as Job[]).map((job, index) => (
              <Link
                key={job.id}
                href={`/jobs/${job.slug}`}
                className={`block glass-card p-6 transition-all hover:translate-x-1 group ${
                  job.featured ? "border-purple-500/30" : ""
                }`}
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                {job.featured && (
                  <span className="inline-flex items-center gap-1.5 bg-purple-500/20 text-purple-400 text-xs font-medium px-3 py-1 rounded-lg border border-purple-500/30 mb-3">
                    <Sparkles className="h-3 w-3" />
                    Featured
                  </span>
                )}

                <div className="flex items-start gap-4">
                  <div className="neu-raised w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                    {job.employer.company_logo_url ? (
                      <img
                        src={job.employer.company_logo_url}
                        alt={job.employer.company_name}
                        className="w-10 h-10 object-contain rounded-lg"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                      {job.title}
                    </h2>
                    <p className="text-gray-400">{job.employer.company_name}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        {job.location_city && job.location_country
                          ? `${job.location_city}, ${job.location_country}`
                          : job.work_location === "remote"
                          ? "Remote"
                          : "Location flexible"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4 text-gray-600" />
                        {job.employment_type.replace(/_/g, " ")}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-gray-600" />
                        {formatSalary(job)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-gray-600" />
                        {formatDate(job.created_at)}
                      </span>
                    </div>

                    {job.skills_required && job.skills_required.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {job.skills_required.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="bg-white/5 text-gray-400 text-xs px-3 py-1 rounded-lg border border-white/10"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills_required.length > 4 && (
                          <span className="text-gray-500 text-xs py-1">
                            +{job.skills_required.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent" />
        
        <div className="container-glass relative z-10">
          <div className="glass-card p-12 md:p-16 text-center">
            <div className="neu-raised w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Globe className="h-8 w-8 text-purple-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Looking to <span className="text-gradient">Hire?</span>
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Post your job on UmukoziHR Jobs and reach thousands of qualified candidates.
            </p>
            <Link
              href="/signup?type=employer"
              className="btn-primary inline-flex items-center gap-3 text-lg"
            >
              Post a Job for Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
