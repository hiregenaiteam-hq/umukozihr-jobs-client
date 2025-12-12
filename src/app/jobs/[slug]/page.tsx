import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building2,
  Globe,
  Users,
  Calendar,
  ExternalLink,
  CheckCircle,
  ArrowLeft,
  Share2,
} from "lucide-react";

interface Job {
  id: string;
  slug: string;
  title: string;
  raw_description: string;
  parsed_description: object | null;
  responsibilities: string[] | null;
  requirements: string[] | null;
  nice_to_have: string[] | null;
  skills_required: string[] | null;
  experience_level: string;
  employment_type: string;
  work_location: string;
  location_city: string | null;
  location_country: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  salary_visible: boolean;
  benefits: string[] | null;
  featured: boolean;
  urgent: boolean;
  created_at: string;
  published_at: string | null;
  expires_at: string | null;
  employer: {
    id: string;
    company_name: string;
    company_slug: string | null;
    company_description: string | null;
    company_logo_url: string | null;
    company_website: string | null;
    company_size: string | null;
    industry: string | null;
    headquarters_city: string | null;
    headquarters_country: string | null;
    verified: boolean;
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("title, raw_description, employer:employers(company_name)")
    .eq("slug", slug)
    .single();

  if (!job) {
    return {
      title: "Job Not Found | UmukoziHR Jobs",
    };
  }

  const employer = job.employer as unknown as { company_name: string } | null;
  const employerName = employer?.company_name || "Company";

  return {
    title: `${job.title} at ${employerName} | UmukoziHR Jobs`,
    description: job.raw_description?.slice(0, 160) + "...",
    openGraph: {
      title: `${job.title} at ${employerName}`,
      description: job.raw_description?.slice(0, 160) + "...",
      type: "website",
    },
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
    return `${formatter.format(job.salary_min)} - ${formatter.format(job.salary_max)} / year`;
  }
  if (job.salary_min) {
    return `From ${formatter.format(job.salary_min)} / year`;
  }
  return `Up to ${formatter.format(job.salary_max!)} / year`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatExperience(level: string) {
  const levels: Record<string, string> = {
    entry: "Entry Level",
    junior: "Junior (1-2 years)",
    mid: "Mid Level (3-5 years)",
    senior: "Senior (5+ years)",
    lead: "Lead / Principal",
    executive: "Executive",
  };
  return levels[level] || level;
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select(`
      *,
      employer:employers(
        id,
        company_name,
        company_slug,
        company_description,
        company_logo_url,
        company_website,
        company_size,
        industry,
        headquarters_city,
        headquarters_country,
        verified
      )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!job) {
    notFound();
  }

  const typedJob = job as unknown as Job;

  // Increment views (fire and forget)
  const currentViews = (job as { views_count?: number }).views_count || 0;
  supabase.from("jobs").update({ views_count: currentViews + 1 }).eq("id", typedJob.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Link */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </div>
      </div>

      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Company Logo */}
            <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              {typedJob.employer.company_logo_url ? (
                <img
                  src={typedJob.employer.company_logo_url}
                  alt={typedJob.employer.company_name}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <Building2 className="h-8 w-8 text-gray-400" />
              )}
            </div>

            {/* Job Info */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {typedJob.featured && (
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded">
                    Featured
                  </span>
                )}
                {typedJob.urgent && (
                  <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded">
                    Urgent
                  </span>
                )}
                {typedJob.employer.verified && (
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded inline-flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified Employer
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {typedJob.title}
              </h1>

              <p className="text-xl text-gray-600 mb-4">
                {typedJob.employer.company_name}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-5 w-5" />
                  {typedJob.location_city && typedJob.location_country
                    ? `${typedJob.location_city}, ${typedJob.location_country}`
                    : typedJob.work_location === "remote"
                    ? "Remote"
                    : "Location flexible"}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-5 w-5" />
                  {typedJob.employment_type.replace(/_/g, " ")}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-5 w-5" />
                  {formatSalary(typedJob)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-5 w-5" />
                  Posted {formatDate(typedJob.published_at || typedJob.created_at)}
                </span>
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex flex-col gap-3">
              <Link
                href={`/jobs/${slug}/apply`}
                className="inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Apply Now
              </Link>
              <button className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition">
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Job Description
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="whitespace-pre-wrap">{typedJob.raw_description}</p>
              </div>
            </div>

            {/* Responsibilities */}
            {typedJob.responsibilities && typedJob.responsibilities.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Responsibilities
                </h2>
                <ul className="space-y-2">
                  {typedJob.responsibilities.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {typedJob.requirements && typedJob.requirements.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Requirements
                </h2>
                <ul className="space-y-2">
                  {typedJob.requirements.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Nice to Have */}
            {typedJob.nice_to_have && typedJob.nice_to_have.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Nice to Have
                </h2>
                <ul className="space-y-2">
                  {typedJob.nice_to_have.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {typedJob.benefits && typedJob.benefits.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Benefits
                </h2>
                <div className="flex flex-wrap gap-2">
                  {typedJob.benefits.map((benefit, i) => (
                    <span
                      key={i}
                      className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Job Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Employment Type</p>
                    <p className="font-medium text-gray-900">
                      {typedJob.employment_type.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Work Location</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {typedJob.work_location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Experience Level</p>
                    <p className="font-medium text-gray-900">
                      {formatExperience(typedJob.experience_level)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Salary</p>
                    <p className="font-medium text-gray-900">
                      {formatSalary(typedJob)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Posted</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(typedJob.published_at || typedJob.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            {typedJob.skills_required && typedJob.skills_required.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {typedJob.skills_required.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Company Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                About the Company
              </h3>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {typedJob.employer.company_logo_url ? (
                    <img
                      src={typedJob.employer.company_logo_url}
                      alt={typedJob.employer.company_name}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <Building2 className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {typedJob.employer.company_name}
                  </p>
                  {typedJob.employer.industry && (
                    <p className="text-sm text-gray-500">{typedJob.employer.industry}</p>
                  )}
                </div>
              </div>

              {typedJob.employer.company_description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-4">
                  {typedJob.employer.company_description}
                </p>
              )}

              <div className="space-y-2 text-sm">
                {typedJob.employer.company_size && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    {typedJob.employer.company_size} employees
                  </div>
                )}
                {(typedJob.employer.headquarters_city || typedJob.employer.headquarters_country) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {[typedJob.employer.headquarters_city, typedJob.employer.headquarters_country]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                )}
                {typedJob.employer.company_website && (
                  <a
                    href={typedJob.employer.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Apply CTA */}
            <div className="bg-indigo-50 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Interested in this job?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Apply now and get matched with similar opportunities.
              </p>
              <Link
                href={`/jobs/${slug}/apply`}
                className="inline-block w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
