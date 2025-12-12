"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import {
  Settings,
  Bell,
  Lock,
  Trash2,
  Save,
} from "lucide-react";

export default function EmployerSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { user } = useAuthStore();
  const supabase = createClient();

  const [notifications, setNotifications] = useState({
    email_new_applications: true,
    email_application_updates: true,
    email_messages: true,
    email_weekly_summary: true,
    email_marketing: false,
  });

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Please fill in all password fields" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Password updated successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }

    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your company account? This will remove all job postings and application data. This action cannot be undone."
    );

    if (!confirmed) return;

    const doubleConfirm = window.prompt(
      'Type "DELETE" to confirm account deletion:'
    );

    if (doubleConfirm !== "DELETE") {
      setMessage({ type: "error", text: "Account deletion cancelled" });
      return;
    }

    setMessage({ type: "error", text: "Account deletion is handled by support. Please contact us." });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences.
        </p>
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

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Bell className="h-5 w-5 text-indigo-600" />
          Notification Preferences
        </h2>

        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">New Applications</p>
              <p className="text-sm text-gray-500">
                Get notified when candidates apply to your jobs
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.email_new_applications}
              onChange={(e) =>
                setNotifications({ ...notifications, email_new_applications: e.target.checked })
              }
              className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Application Updates</p>
              <p className="text-sm text-gray-500">
                Get notified when candidates update their applications
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.email_application_updates}
              onChange={(e) =>
                setNotifications({ ...notifications, email_application_updates: e.target.checked })
              }
              className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Messages</p>
              <p className="text-sm text-gray-500">
                Get notified when candidates send you messages
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.email_messages}
              onChange={(e) =>
                setNotifications({ ...notifications, email_messages: e.target.checked })
              }
              className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Weekly Summary</p>
              <p className="text-sm text-gray-500">
                Receive a weekly summary of your job performance
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.email_weekly_summary}
              onChange={(e) =>
                setNotifications({ ...notifications, email_weekly_summary: e.target.checked })
              }
              className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Marketing & Tips</p>
              <p className="text-sm text-gray-500">
                Receive hiring tips and product updates
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.email_marketing}
              onChange={(e) =>
                setNotifications({ ...notifications, email_marketing: e.target.checked })
              }
              className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Lock className="h-5 w-5 text-indigo-600" />
          Change Password
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Show passwords
            </label>

            <button
              onClick={handlePasswordChange}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Danger Zone
        </h2>

        <p className="text-gray-600 mb-4">
          Deleting your account will remove all job postings, applications, and company data. This action cannot be undone.
        </p>

        <button
          onClick={handleDeleteAccount}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
        >
          <Trash2 className="h-4 w-4" />
          Delete Company Account
        </button>
      </div>
    </div>
  );
}
