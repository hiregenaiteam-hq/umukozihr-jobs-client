"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import {
  Building2,
  Globe,
  Link as LinkIcon,
  MapPin,
  Users,
  Calendar,
  Save,
  Plus,
  X,
} from "lucide-react";

interface EmployerProfile {
  id: string;
  company_name: string;
  company_slug: string | null;
  company_description: string | null;
  company_logo_url: string | null;
  company_website: string | null;
  company_linkedin: string | null;
  company_size: string | null;
  industry: string | null;
  founded_year: number | null;
  headquarters_country: string | null;
  headquarters_city: string | null;
  tech_stack: string[] | null;
  verified: boolean;
}

export default function EmployerCompanyPage() {
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { user } = useAuthStore();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    company_name: "",
    company_description: "",
    company_website: "",
    company_linkedin: "",
    company_size: "",
    industry: "",
    founded_year: "",
    headquarters_country: "",
    headquarters_city: "",
  });

  const [techStack, setTechStack] = useState<string[]>([]);
  const [newTech, setNewTech] = useState("");

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    const { data: employer } = await supabase
      .from("employers")
      .select("*")
      .eq("profile_id", user.id)
      .single();

    if (employer) {
      setProfile(employer);
      setFormData({
        company_name: employer.company_name || "",
        company_description: employer.company_description || "",
        company_website: employer.company_website || "",
        company_linkedin: employer.company_linkedin || "",
        company_size: employer.company_size || "",
        industry: employer.industry || "",
        founded_year: employer.founded_year?.toString() || "",
        headquarters_country: employer.headquarters_country || "",
        headquarters_city: employer.headquarters_city || "",
      });
      setTechStack(employer.tech_stack || []);
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
      .from("employers")
      .update({
        company_name: formData.company_name,
        company_description: formData.company_description || null,
        company_website: formData.company_website || null,
        company_linkedin: formData.company_linkedin || null,
        company_size: formData.company_size || null,
        industry: formData.industry || null,
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
        headquarters_country: formData.headquarters_country || null,
        headquarters_city: formData.headquarters_city || null,
        tech_stack: techStack.length > 0 ? techStack : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) {
      setMessage({ type: "error", text: "Failed to save profile" });
    } else {
      setMessage({ type: "success", text: "Company profile saved successfully" });
    }

    setSaving(false);
  };

  const addTech = () => {
    if (!newTech.trim()) return;
    if (techStack.includes(newTech.trim())) return;
    setTechStack([...techStack, newTech.trim()]);
    setNewTech("");
  };

  const removeTech = (index: number) => {
    setTechStack(techStack.filter((_, i) => i !== index));
  };

  const companySizes = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1001-5000",
    "5001-10000",
    "10000+",
  ];

  const industries = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "E-commerce",
    "Manufacturing",
    "Consulting",
    "Media & Entertainment",
    "Telecommunications",
    "Real Estate",
    "Transportation",
    "Non-profit",
    "Government",
    "Other",
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-gray-600 mt-1">
            Showcase your company to attract top talent.
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

      {/* Verification Status */}
      {profile?.verified ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <Building2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-800">Verified Company</p>
            <p className="text-sm text-green-600">
              Your company has been verified by UmukoziHR.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-full">
            <Building2 className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-amber-800">Pending Verification</p>
            <p className="text-sm text-amber-600">
              Complete your profile to get verified and increase visibility.
            </p>
          </div>
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-indigo-600" />
          Basic Information
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Description
            </label>
            <textarea
              value={formData.company_description}
              onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
              rows={5}
              placeholder="Tell candidates about your company, culture, and what makes it a great place to work..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select Industry</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size
              </label>
              <select
                value={formData.company_size}
                onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select Size</option>
                {companySizes.map((size) => (
                  <option key={size} value={size}>
                    {size} employees
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Founded Year
            </label>
            <input
              type="number"
              value={formData.founded_year}
              onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
              placeholder="2020"
              min="1800"
              max={new Date().getFullYear()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-indigo-600" />
          Headquarters
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              value={formData.headquarters_country}
              onChange={(e) => setFormData({ ...formData, headquarters_country: e.target.value })}
              placeholder="Rwanda"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.headquarters_city}
              onChange={(e) => setFormData({ ...formData, headquarters_city: e.target.value })}
              placeholder="Kigali"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Online Presence */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Globe className="h-5 w-5 text-indigo-600" />
          Online Presence
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <LinkIcon className="inline h-4 w-4 mr-1" /> Website
            </label>
            <input
              type="url"
              value={formData.company_website}
              onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
              placeholder="https://yourcompany.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <LinkIcon className="inline h-4 w-4 mr-1" /> LinkedIn
            </label>
            <input
              type="url"
              value={formData.company_linkedin}
              onChange={(e) => setFormData({ ...formData, company_linkedin: e.target.value })}
              placeholder="https://linkedin.com/company/yourcompany"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Tech Stack (optional)
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Add technologies your company uses to attract relevant candidates.
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
            placeholder="Add a technology (e.g., Python, AWS)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={addTech}
            className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {techStack.map((tech, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full"
            >
              {tech}
              <button
                type="button"
                onClick={() => removeTech(index)}
                className="hover:text-indigo-900"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
