"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import {
  ArrowLeft,
  Upload,
  FileText,
  Sparkles,
  CheckCircle,
  Building2,
} from "lucide-react";

interface Job {
  id: string;
  slug: string;
  title: string;
  employer: {
    company_name: string;
    company_logo_url: string | null;
  };
}

interface Candidate {
  id: string;
  resume_url: string | null;
  headline: string | null;
}

export default function ApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [notes, setNotes] = useState("");
  const [useExistingResume, setUseExistingResume] = useState(true);
  const [useTailor, setUseTailor] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    // Get job
    const { data: jobData } = await supabase
      .from("jobs")
      .select(`
        id,
        slug,
        title,
        employer:employers(company_name, company_logo_url)
      `)
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (!jobData) {
      router.push("/jobs");
      return;
    }

    setJob(jobData as unknown as Job);

    // Get candidate if logged in
    if (user?.id) {
      const { data: candidateData } = await supabase
        .from("candidates")
        .select("id, resume_url, headline")
        .eq("profile_id", user.id)
        .single();

      if (candidateData) {
        setCandidate(candidateData);
      }
    }

    setLoading(false);
  }, [supabase, slug, user, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push(`/signin?redirect=/jobs/${slug}/apply`);
      return;
    }

    if (!candidate) {
      alert("Please complete your candidate profile first");
      return;
    }

    if (!job) return;

    setSubmitting(true);

    // Check if already applied
    const { data: existingApp } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", job.id)
      .eq("candidate_id", candidate.id)
      .single();

    if (existingApp) {
      alert("You have already applied to this job");
      setSubmitting(false);
      return;
    }

    // Create application
    const { error } = await supabase.from("applications").insert({
      job_id: job.id,
      candidate_id: candidate.id,
      resume_url: candidate.resume_url,
      candidate_notes: notes || null,
      status: "pending",
    });

    if (error) {
      alert("Failed to submit application: " + error.message);
      setSubmitting(false);
      return;
    }

    // Update job applications count (optional - can be done via trigger)
    try {
      const { data: currentJob } = await supabase
        .from("jobs")
        .select("applications_count")
        .eq("id", job.id)
        .single();
      if (currentJob) {
        await supabase
          .from("jobs")
          .update({ applications_count: (currentJob.applications_count || 0) + 1 })
          .eq("id", job.id);
      }
    } catch { /* ignore */ }

    setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Application Submitted!
          </h1>
          <p className="text-gray-600 mb-6">
            Your application for <strong>{job?.title}</strong> at{" "}
            <strong>{job?.employer.company_name}</strong> has been sent.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            The employer will review your application and contact you if there&apos;s a match.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/candidate/applications"
              className="block bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              View My Applications
            </Link>
            <Link
              href="/jobs"
              className="block text-indigo-600 font-medium hover:text-indigo-700"
            >
              Browse More Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link
            href={`/jobs/${slug}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Job
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Job Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {job?.employer.company_logo_url ? (
                <img
                  src={job.employer.company_logo_url}
                  alt={job.employer.company_name}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <Building2 className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Apply for {job?.title}
              </h1>
              <p className="text-gray-600">{job?.employer.company_name}</p>
            </div>
          </div>
        </div>

        {/* Auth Check */}
        {!user ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sign in to Apply
            </h2>
            <p className="text-gray-600 mb-6">
              Create an account or sign in to submit your application.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/signin?redirect=/jobs/${slug}/apply`}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Sign In
              </Link>
              <Link
                href={`/signup?type=candidate&redirect=/jobs/${slug}/apply`}
                className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition"
              >
                Create Account
              </Link>
            </div>
          </div>
        ) : !candidate ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Complete Your Profile
            </h2>
            <p className="text-gray-600 mb-6">
              Please complete your candidate profile before applying.
            </p>
            <Link
              href="/candidate/profile"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Complete Profile
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Resume Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Resume
              </h2>

              {candidate.resume_url ? (
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={useExistingResume && !useTailor}
                      onChange={() => {
                        setUseExistingResume(true);
                        setUseTailor(false);
                      }}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Use my existing resume</p>
                      <p className="text-sm text-gray-500">
                        Apply with the resume from your profile
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={useTailor}
                      onChange={() => {
                        setUseExistingResume(false);
                        setUseTailor(true);
                      }}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-gray-900 flex items-center gap-2">
                          Generate tailored resume
                          <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded">
                            Recommended
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Use UmukoziHR Tailor to create a customized resume for this job
                        </p>
                      </div>
                      <Sparkles className="h-5 w-5 text-indigo-600" />
                    </div>
                  </label>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Upload className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">
                    No resume on file. Add one to your profile or use Tailor.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/candidate/profile"
                      className="text-indigo-600 font-medium hover:text-indigo-700"
                    >
                      Upload Resume
                    </Link>
                    <button
                      type="button"
                      onClick={() => setUseTailor(true)}
                      className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1 justify-center"
                    >
                      <Sparkles className="h-4 w-4" />
                      Use Tailor
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Notes */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Notes (Optional)
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add any additional information you'd like the employer to know..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Link
                href={`/jobs/${slug}`}
                className="text-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
