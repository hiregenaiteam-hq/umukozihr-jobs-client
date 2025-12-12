"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Link as LinkIcon,
  Save,
  Plus,
  X,
  Upload,
  Sparkles,
} from "lucide-react";

interface Skill {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
}

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string | null;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  field: string;
  institution: string;
  location: string;
  start_date: string;
  end_date: string | null;
  current: boolean;
}

interface CandidateProfile {
  id: string;
  headline: string;
  summary: string;
  resume_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  languages: { language: string; proficiency: string }[];
  preferred_locations: string[];
  preferred_employment_types: string[];
  preferred_work_locations: string[];
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  expected_salary_currency: string;
  actively_looking: boolean;
  open_to_opportunities: boolean;
  profile_completeness: number;
}

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { user } = useAuthStore();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    headline: "",
    summary: "",
    linkedin_url: "",
    portfolio_url: "",
    github_url: "",
    expected_salary_min: "",
    expected_salary_max: "",
    expected_salary_currency: "USD",
    actively_looking: true,
    open_to_opportunities: true,
  });

  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    const { data: candidate } = await supabase
      .from("candidates")
      .select("*")
      .eq("profile_id", user.id)
      .single();

    if (candidate) {
      setProfile(candidate);
      setFormData({
        headline: candidate.headline || "",
        summary: candidate.summary || "",
        linkedin_url: candidate.linkedin_url || "",
        portfolio_url: candidate.portfolio_url || "",
        github_url: candidate.github_url || "",
        expected_salary_min: candidate.expected_salary_min?.toString() || "",
        expected_salary_max: candidate.expected_salary_max?.toString() || "",
        expected_salary_currency: candidate.expected_salary_currency || "USD",
        actively_looking: candidate.actively_looking ?? true,
        open_to_opportunities: candidate.open_to_opportunities ?? true,
      });
      setSkills(candidate.skills || []);
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!profile?.id) return;

    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("candidates")
      .update({
        headline: formData.headline,
        summary: formData.summary,
        linkedin_url: formData.linkedin_url || null,
        portfolio_url: formData.portfolio_url || null,
        github_url: formData.github_url || null,
        expected_salary_min: formData.expected_salary_min ? parseInt(formData.expected_salary_min) : null,
        expected_salary_max: formData.expected_salary_max ? parseInt(formData.expected_salary_max) : null,
        expected_salary_currency: formData.expected_salary_currency,
        actively_looking: formData.actively_looking,
        open_to_opportunities: formData.open_to_opportunities,
        skills,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) {
      setMessage({ type: "error", text: "Failed to save profile" });
    } else {
      setMessage({ type: "success", text: "Profile saved successfully" });
      fetchProfile();
    }

    setSaving(false);
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (skills.some((s) => s.name.toLowerCase() === newSkill.toLowerCase())) return;

    setSkills([...skills, { name: newSkill.trim(), level: "intermediate" }]);
    setNewSkill("");
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkillLevel = (index: number, level: Skill["level"]) => {
    const updated = [...skills];
    updated[index].level = level;
    setSkills(updated);
  };

  const calculateCompleteness = () => {
    let score = 0;
    if (formData.headline) score += 10;
    if (formData.summary) score += 15;
    if (formData.linkedin_url) score += 10;
    if (skills.length > 0) score += 20;
    if (profile?.experience && profile.experience.length > 0) score += 20;
    if (profile?.education && profile.education.length > 0) score += 15;
    if (formData.expected_salary_min || formData.expected_salary_max) score += 10;
    return Math.min(score, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">
            Keep your profile updated to improve job matches.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Completeness */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Profile Strength</h2>
          <span className="text-2xl font-bold text-indigo-600">
            {calculateCompleteness()}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${calculateCompleteness()}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Complete your profile to improve visibility and job match accuracy.
        </p>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <User className="h-5 w-5 text-indigo-600" />
          Basic Information
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Headline
            </label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="e.g., Senior Software Engineer | Full-Stack Developer"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Summary
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={4}
              placeholder="Write a brief summary of your professional background, key achievements, and career goals..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <LinkIcon className="inline h-4 w-4 mr-1" /> LinkedIn Profile
              </label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <LinkIcon className="inline h-4 w-4 mr-1" /> Portfolio URL
              </label>
              <input
                type="url"
                value={formData.portfolio_url}
                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                placeholder="https://yourportfolio.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <LinkIcon className="inline h-4 w-4 mr-1" /> GitHub Profile
            </label>
            <input
              type="url"
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              placeholder="https://github.com/yourusername"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          Skills
        </h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addSkill()}
            placeholder="Add a skill (e.g., Python, Project Management)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={addSkill}
            className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2"
            >
              <span className="text-gray-800">{skill.name}</span>
              <select
                value={skill.level}
                onChange={(e) => updateSkillLevel(index, e.target.value as Skill["level"])}
                className="text-xs bg-transparent border-none focus:ring-0 text-gray-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <button
                onClick={() => removeSkill(index)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {skills.length === 0 && (
          <p className="text-gray-500 text-sm">
            Add skills to help employers find you and improve job matches.
          </p>
        )}
      </div>

      {/* Job Preferences */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-indigo-600" />
          Job Preferences
        </h2>

        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Salary
              </label>
              <input
                type="number"
                value={formData.expected_salary_min}
                onChange={(e) => setFormData({ ...formData, expected_salary_min: e.target.value })}
                placeholder="50000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Salary
              </label>
              <input
                type="number"
                value={formData.expected_salary_max}
                onChange={(e) => setFormData({ ...formData, expected_salary_max: e.target.value })}
                placeholder="100000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.expected_salary_currency}
                onChange={(e) => setFormData({ ...formData, expected_salary_currency: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="RWF">RWF</option>
                <option value="KES">KES</option>
                <option value="UGX">UGX</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.actively_looking}
                onChange={(e) => setFormData({ ...formData, actively_looking: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700">Actively looking for a job</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.open_to_opportunities}
                onChange={(e) => setFormData({ ...formData, open_to_opportunities: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700">Open to opportunities</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tailor Integration */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <div className="flex items-start gap-4">
          <div className="bg-indigo-100 p-3 rounded-lg">
            <Sparkles className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Import from UmukoziHR Tailor
            </h3>
            <p className="text-gray-600 mt-1">
              Already have a profile in Tailor? Import your skills, experience, and preferences automatically.
            </p>
            <button className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
              <Upload className="h-4 w-4" />
              Import from Tailor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
