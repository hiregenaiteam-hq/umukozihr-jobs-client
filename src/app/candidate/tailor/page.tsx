"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import {
  Sparkles,
  FileText,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  Clock,
} from "lucide-react";

interface TailorRun {
  id: string;
  created_at: string;
  resume_url: string | null;
  cover_letter_url: string | null;
  external_job_url: string | null;
  job: {
    title: string;
    slug: string;
    employer: {
      company_name: string;
    };
  } | null;
}

export default function CandidateTailorPage() {
  const [tailorRuns, setTailorRuns] = useState<TailorRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [tailorConnected, setTailorConnected] = useState(false);
  const { user } = useAuthStore();
  const supabase = createClient();

  const fetchTailorRuns = useCallback(async () => {
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
      .from("tailor_runs")
      .select(`
        id,
        created_at,
        resume_url,
        cover_letter_url,
        external_job_url,
        job:jobs(title, slug, employer:employers(company_name))
      `)
      .eq("candidate_id", candidate.id)
      .order("created_at", { ascending: false })
      .limit(10);

    setTailorRuns((data as unknown as TailorRun[]) || []);

    // Check if user has Tailor profile connected
    const { data: profile } = await supabase
      .from("profiles")
      .select("tailor_profile_id")
      .eq("id", user.id)
      .single();

    setTailorConnected(!!profile?.tailor_profile_id);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchTailorRuns();
  }, [fetchTailorRuns]);

  const handleImportFromTailor = async () => {
    setImporting(true);
    // Simulate import - in production this would call the Tailor API
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert("Profile import feature coming soon! This will sync your data from UmukoziHR Tailor.");
    setImporting(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-indigo-600" />
          Tailor Integration
        </h1>
        <p className="text-gray-600 mt-1">
          Connect with UmukoziHR Tailor to generate tailored resumes and cover letters.
        </p>
      </div>

      {/* Connection Status */}
      <div className={`rounded-xl p-6 ${tailorConnected ? "bg-green-50 border border-green-200" : "bg-indigo-50 border border-indigo-200"}`}>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {tailorConnected ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-green-800">
                    Tailor Connected
                  </h2>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-indigo-800">
                    Connect to Tailor
                  </h2>
                </>
              )}
            </div>
            <p className={tailorConnected ? "text-green-700" : "text-indigo-700"}>
              {tailorConnected
                ? "Your profile is synced with UmukoziHR Tailor. Generate tailored resumes for any job!"
                : "Link your UmukoziHR Tailor account to import your profile and generate tailored resumes."}
            </p>
          </div>
          <div className="flex gap-3">
            {tailorConnected ? (
              <>
                <button
                  onClick={handleImportFromTailor}
                  disabled={importing}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${importing ? "animate-spin" : ""}`} />
                  {importing ? "Syncing..." : "Sync Profile"}
                </button>
                <a
                  href="https://tailor.umukozihr.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border border-green-600 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition"
                >
                  Open Tailor
                  <ExternalLink className="h-4 w-4" />
                </a>
              </>
            ) : (
              <button
                onClick={handleImportFromTailor}
                disabled={importing}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                <Upload className="h-5 w-5" />
                {importing ? "Connecting..." : "Connect Tailor Account"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          How Tailor Integration Works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-indigo-600 font-bold">1</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Import Profile</h3>
            <p className="text-sm text-gray-600">
              Connect your Tailor account to import your professional profile, skills, and experience.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-indigo-600 font-bold">2</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Find a Job</h3>
            <p className="text-sm text-gray-600">
              Browse jobs on UmukoziHR Jobs and find opportunities that match your skills.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-indigo-600 font-bold">3</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Generate & Apply</h3>
            <p className="text-sm text-gray-600">
              Generate a tailored resume optimized for the job description and apply instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Previous Tailor Runs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Generated Documents
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Your previously generated tailored resumes and cover letters.
          </p>
        </div>

        {tailorRuns.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 font-medium mb-2">No documents yet</h3>
            <p className="text-gray-500 text-sm">
              When you generate tailored resumes, they&apos;ll appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tailorRuns.map((run) => (
              <div key={run.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {run.job ? (
                        <>
                          Resume for {run.job.title} at {run.job.employer.company_name}
                        </>
                      ) : run.external_job_url ? (
                        "Resume for external job"
                      ) : (
                        "General resume"
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Clock className="h-4 w-4" />
                      Generated {formatDate(run.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {run.resume_url && (
                      <a
                        href={run.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-indigo-600 text-sm font-medium hover:text-indigo-700"
                      >
                        <Download className="h-4 w-4" />
                        Resume
                      </a>
                    )}
                    {run.cover_letter_url && (
                      <a
                        href={run.cover_letter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-indigo-600 text-sm font-medium hover:text-indigo-700"
                      >
                        <Download className="h-4 w-4" />
                        Cover Letter
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white text-center">
        <Sparkles className="h-10 w-10 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          Ready to Create a Tailored Resume?
        </h2>
        <p className="text-indigo-100 mb-6 max-w-lg mx-auto">
          Browse our job listings and apply with a resume perfectly tailored to each opportunity.
        </p>
        <a
          href="/candidate/jobs"
          className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
        >
          Browse Jobs
        </a>
      </div>
    </div>
  );
}
