"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Save,
  Eye,
  ArrowLeft,
  Plus,
  X,
  Sparkles,
} from "lucide-react";

export default function NewJobPage() {
  const [loading, setLoading] = useState(false);
  const [employerId, setEmployerId] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuthStore();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    title: "",
    raw_description: "",
    employment_type: "full_time",
    work_location: "remote",
    experience_level: "mid",
    location_country: "",
    location_city: "",
    salary_min: "",
    salary_max: "",
    salary_currency: "USD",
    salary_visible: true,
    application_email: "",
    application_url: "",
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState("");

  const fetchEmployer = useCallback(async () => {
    if (!user?.id) return;

    const { data: employer } = await supabase
      .from("employers")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (employer) {
      setEmployerId(employer.id);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchEmployer();
  }, [fetchEmployer]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + "-" + Date.now();
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (skills.includes(newSkill.trim())) return;
    setSkills([...skills, newSkill.trim()]);
    setNewSkill("");
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    if (benefits.includes(newBenefit.trim())) return;
    setBenefits([...benefits, newBenefit.trim()]);
    setNewBenefit("");
  };

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleSubmit = async (publish: boolean) => {
    if (!employerId) {
      alert("Employer profile not found. Please complete your company profile first.");
      return;
    }

    if (!formData.title.trim()) {
      alert("Please enter a job title");
      return;
    }

    if (!formData.raw_description.trim()) {
      alert("Please enter a job description");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        employer_id: employerId,
        slug: generateSlug(formData.title),
        title: formData.title,
        raw_description: formData.raw_description,
        employment_type: formData.employment_type,
        work_location: formData.work_location,
        experience_level: formData.experience_level,
        location_country: formData.location_country || null,
        location_city: formData.location_city || null,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        salary_currency: formData.salary_currency,
        salary_visible: formData.salary_visible,
        skills_required: skills.length > 0 ? skills : null,
        benefits: benefits.length > 0 ? benefits : null,
        application_email: formData.application_email || null,
        application_url: formData.application_url || null,
        status: publish ? "published" : "draft",
        published_at: publish ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      alert("Failed to create job: " + error.message);
      setLoading(false);
      return;
    }

    router.push(`/employer/jobs/${data.slug}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
          <p className="text-gray-600 mt-1">
            Fill in the details to create a new job posting.
          </p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-indigo-600" />
          Job Details
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              value={formData.raw_description}
              onChange={(e) => setFormData({ ...formData, raw_description: e.target.value })}
              rows={10}
              placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Tip: Include responsibilities, requirements, and what success looks like in this role.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Type
              </label>
              <select
                value={formData.employment_type}
                onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Location
              </label>
              <select
                value={formData.work_location}
                onChange={(e) => setFormData({ ...formData, work_location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={formData.experience_level}
                onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="entry">Entry Level</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-indigo-600" />
          Location
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              value={formData.location_country}
              onChange={(e) => setFormData({ ...formData, location_country: e.target.value })}
              placeholder="e.g., Rwanda"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.location_city}
              onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
              placeholder="e.g., Kigali"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Salary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-indigo-600" />
          Compensation
        </h2>

        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Salary (Annual)
              </label>
              <input
                type="number"
                value={formData.salary_min}
                onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                placeholder="50000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Salary (Annual)
              </label>
              <input
                type="number"
                value={formData.salary_max}
                onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                placeholder="80000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.salary_currency}
                onChange={(e) => setFormData({ ...formData, salary_currency: e.target.value })}
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

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.salary_visible}
              onChange={(e) => setFormData({ ...formData, salary_visible: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-700">Show salary on job listing</span>
          </label>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          Required Skills
        </h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            placeholder="Add a required skill"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={addSkill}
            className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="hover:text-indigo-900"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Benefits</h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newBenefit}
            onChange={(e) => setNewBenefit(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())}
            placeholder="Add a benefit (e.g., Health Insurance)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={addBenefit}
            className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {benefits.map((benefit, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full"
            >
              {benefit}
              <button
                type="button"
                onClick={() => removeBenefit(index)}
                className="hover:text-green-900"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Application Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Application Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Email (optional)
            </label>
            <input
              type="email"
              value={formData.application_email}
              onChange={(e) => setFormData({ ...formData, application_email: e.target.value })}
              placeholder="hiring@company.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave empty to receive applications through UmukoziHR Jobs.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              External Application URL (optional)
            </label>
            <input
              type="url"
              value={formData.application_url}
              onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
              placeholder="https://yourcompany.com/careers/apply"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <button
          onClick={() => handleSubmit(false)}
          disabled={loading}
          className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          Save as Draft
        </button>
        <button
          onClick={() => handleSubmit(true)}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          <Eye className="h-5 w-5" />
          {loading ? "Publishing..." : "Publish Job"}
        </button>
      </div>
    </div>
  );
}
