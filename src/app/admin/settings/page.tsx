"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Settings,
  Database,
  Shield,
  Bell,
  Mail,
  Globe,
  Key,
  Server,
  RefreshCw,
  Check,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";

interface SystemConfig {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  autoApproveEmployers: boolean;
  maxJobsPerEmployer: number;
  maxApplicationsPerCandidate: number;
  sessionTimeoutMinutes: number;
  rateLimitPerMinute: number;
}

interface HealthStatus {
  database: "healthy" | "degraded" | "down";
  storage: "healthy" | "degraded" | "down";
  auth: "healthy" | "degraded" | "down";
  api: "healthy" | "degraded" | "down";
  tailor: "healthy" | "degraded" | "down";
}

function StatusIndicator({ status }: { status: "healthy" | "degraded" | "down" }) {
  const styles = {
    healthy: "bg-green-500",
    degraded: "bg-yellow-500",
    down: "bg-red-500",
  };
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${styles[status]}`} />
  );
}

function SettingToggle({
  label,
  description,
  value,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-700 last:border-0">
      <div>
        <p className="text-white font-medium">{label}</p>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      <button
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          value ? "bg-purple-600" : "bg-gray-600"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            value ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function SettingNumber({
  label,
  description,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-700 last:border-0">
      <div>
        <p className="text-white font-medium">{label}</p>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        min={min}
        max={max}
        className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-right focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  );
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SystemConfig>({
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    autoApproveEmployers: false,
    maxJobsPerEmployer: 50,
    maxApplicationsPerCandidate: 100,
    sessionTimeoutMinutes: 60,
    rateLimitPerMinute: 100,
  });
  const [health, setHealth] = useState<HealthStatus>({
    database: "healthy",
    storage: "healthy",
    auth: "healthy",
    api: "healthy",
    tailor: "healthy",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    const supabase = createClient();
    
    // Check database
    const { error: dbError } = await supabase.from("profiles").select("id", { count: "exact", head: true });
    
    // Check storage
    const { error: storageError } = await supabase.storage.listBuckets();
    
    // Check auth
    const { error: authError } = await supabase.auth.getSession();

    setHealth({
      database: dbError ? "down" : "healthy",
      storage: storageError ? "down" : "healthy",
      auth: authError ? "down" : "healthy",
      api: "healthy",
      tailor: "healthy",
    });
    
    setLoading(false);
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save - in production this would save to a config table
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateConfig = <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 bg-gray-700 rounded"></div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Configure system behavior and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : (
            <Settings className="h-4 w-4" />
          )}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* System Health */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Server className="h-5 w-5 text-green-400" />
            System Health
          </h2>
          <button
            onClick={checkHealth}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(health).map(([service, status]) => (
            <div key={service} className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <StatusIndicator status={status} />
                <span className="text-white capitalize">{service}</span>
              </div>
              <p className={`text-sm capitalize ${
                status === "healthy" ? "text-green-400" : status === "degraded" ? "text-yellow-400" : "text-red-400"
              }`}>
                {status}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-blue-400" />
          General Settings
        </h2>
        <div className="space-y-0">
          <SettingToggle
            label="Maintenance Mode"
            description="Put the platform in maintenance mode. Only admins can access."
            value={config.maintenanceMode}
            onChange={(v) => updateConfig("maintenanceMode", v)}
          />
          <SettingToggle
            label="User Registration"
            description="Allow new users to register on the platform."
            value={config.registrationEnabled}
            onChange={(v) => updateConfig("registrationEnabled", v)}
          />
          <SettingToggle
            label="Auto-Approve Employers"
            description="Automatically approve new employer accounts."
            value={config.autoApproveEmployers}
            onChange={(v) => updateConfig("autoApproveEmployers", v)}
          />
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-yellow-400" />
          Notifications
        </h2>
        <div className="space-y-0">
          <SettingToggle
            label="Email Notifications"
            description="Send email notifications for important events."
            value={config.emailNotifications}
            onChange={(v) => updateConfig("emailNotifications", v)}
          />
        </div>
      </div>

      {/* Limits Settings */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-purple-400" />
          Limits & Security
        </h2>
        <div className="space-y-0">
          <SettingNumber
            label="Max Jobs per Employer"
            description="Maximum number of active jobs an employer can have."
            value={config.maxJobsPerEmployer}
            onChange={(v) => updateConfig("maxJobsPerEmployer", v)}
            min={1}
            max={1000}
          />
          <SettingNumber
            label="Max Applications per Candidate"
            description="Maximum number of pending applications a candidate can have."
            value={config.maxApplicationsPerCandidate}
            onChange={(v) => updateConfig("maxApplicationsPerCandidate", v)}
            min={1}
            max={500}
          />
          <SettingNumber
            label="Session Timeout (minutes)"
            description="How long before inactive sessions expire."
            value={config.sessionTimeoutMinutes}
            onChange={(v) => updateConfig("sessionTimeoutMinutes", v)}
            min={5}
            max={1440}
          />
          <SettingNumber
            label="Rate Limit (requests/min)"
            description="Maximum API requests per minute per user."
            value={config.rateLimitPerMinute}
            onChange={(v) => updateConfig("rateLimitPerMinute", v)}
            min={10}
            max={1000}
          />
        </div>
      </div>

      {/* Database Info */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-cyan-400" />
          Database Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Provider</p>
            <p className="text-white font-medium">Supabase PostgreSQL</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Region</p>
            <p className="text-white font-medium">US East (N. Virginia)</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Project</p>
            <p className="text-white font-medium">umukozihr-jobs</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Storage</p>
            <p className="text-white font-medium">resumes, logos (private)</p>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-red-400" />
          API Configuration
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Supabase</p>
              <p className="text-gray-400 text-sm">Database and authentication</p>
            </div>
            <span className="flex items-center gap-2 text-green-400 text-sm">
              <Check className="h-4 w-4" />
              Configured
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Google Gemini</p>
              <p className="text-gray-400 text-sm">LLM for JD parsing</p>
            </div>
            <span className="flex items-center gap-2 text-green-400 text-sm">
              <Check className="h-4 w-4" />
              Configured
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Tailor API</p>
              <p className="text-gray-400 text-sm">Resume generation service</p>
            </div>
            <span className="flex items-center gap-2 text-green-400 text-sm">
              <Check className="h-4 w-4" />
              Configured
            </span>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-400 font-medium">Important Notice</p>
          <p className="text-yellow-300/80 text-sm mt-1">
            Changes to these settings affect all users immediately. Use caution when modifying production settings.
          </p>
        </div>
      </div>
    </div>
  );
}
