"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  Building,
  Sparkles,
  Activity,
} from "lucide-react";

interface OverviewMetrics {
  totalUsers: number;
  totalCandidates: number;
  totalEmployers: number;
  totalJobs: number;
  publishedJobs: number;
  totalApplications: number;
  pendingApplications: number;
  totalTailorRuns: number;
  totalJobViews: number;
  signupsToday: number;
  applicationsToday: number;
  jobsPostedToday: number;
}

interface LiveActivity {
  id: string;
  type: "signup" | "application" | "job_posted" | "tailor_run";
  message: string;
  timestamp: string;
}

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = "purple",
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down";
  trendValue?: string;
  color?: "purple" | "green" | "blue" | "yellow" | "red";
}) {
  const colorClasses = {
    purple: "bg-purple-600/20 text-purple-400 border-purple-600/30",
    green: "bg-green-600/20 text-green-400 border-green-600/30",
    blue: "bg-blue-600/20 text-blue-400 border-blue-600/30",
    yellow: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
    red: "bg-red-600/20 text-red-400 border-red-600/30",
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <div
            className={`flex items-center text-sm ${
              trend === "up" ? "text-green-400" : "text-red-400"
            }`}
          >
            <TrendingUp
              className={`h-4 w-4 mr-1 ${trend === "down" ? "rotate-180" : ""}`}
            />
            {trendValue}
          </div>
        )}
      </div>
      <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-white mt-1">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

function LiveActivityFeed({ activities }: { activities: LiveActivity[] }) {
  const getIcon = (type: LiveActivity["type"]) => {
    switch (type) {
      case "signup":
        return <UserPlus className="h-4 w-4 text-green-400" />;
      case "application":
        return <FileText className="h-4 w-4 text-blue-400" />;
      case "job_posted":
        return <Briefcase className="h-4 w-4 text-purple-400" />;
      case "tailor_run":
        return <Sparkles className="h-4 w-4 text-yellow-400" />;
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Live Activity</h3>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs text-gray-400">Real-time</span>
        </div>
      </div>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg"
            >
              <div className="mt-0.5">{getIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<OverviewMetrics>({
    totalUsers: 0,
    totalCandidates: 0,
    totalEmployers: 0,
    totalJobs: 0,
    publishedJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalTailorRuns: 0,
    totalJobViews: 0,
    signupsToday: 0,
    applicationsToday: 0,
    jobsPostedToday: 0,
  });
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    const supabase = createClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      profilesResult,
      candidatesResult,
      employersResult,
      jobsResult,
      publishedJobsResult,
      applicationsResult,
      pendingAppsResult,
      tailorRunsResult,
      jobViewsResult,
      signupsTodayResult,
      appsTodayResult,
      jobsTodayResult,
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("candidates").select("id", { count: "exact", head: true }),
      supabase.from("employers").select("id", { count: "exact", head: true }),
      supabase.from("jobs").select("id", { count: "exact", head: true }),
      supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("applications").select("id", { count: "exact", head: true }),
      supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("tailor_runs").select("id", { count: "exact", head: true }),
      supabase.from("job_views").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
      supabase.from("applications").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
      supabase.from("jobs").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    ]);

    setMetrics({
      totalUsers: profilesResult.count || 0,
      totalCandidates: candidatesResult.count || 0,
      totalEmployers: employersResult.count || 0,
      totalJobs: jobsResult.count || 0,
      publishedJobs: publishedJobsResult.count || 0,
      totalApplications: applicationsResult.count || 0,
      pendingApplications: pendingAppsResult.count || 0,
      totalTailorRuns: tailorRunsResult.count || 0,
      totalJobViews: jobViewsResult.count || 0,
      signupsToday: signupsTodayResult.count || 0,
      applicationsToday: appsTodayResult.count || 0,
      jobsPostedToday: jobsTodayResult.count || 0,
    });

    setLastUpdate(new Date());
    setLoading(false);
  };

  const subscribeToChanges = () => {
    const supabase = createClient();

    const profilesChannel = supabase
      .channel("admin-profiles")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, (payload) => {
        const newActivity: LiveActivity = {
          id: crypto.randomUUID(),
          type: "signup",
          message: `New ${payload.new.user_type} signed up`,
          timestamp: new Date().toISOString(),
        };
        setActivities((prev) => [newActivity, ...prev.slice(0, 49)]);
        fetchMetrics();
      })
      .subscribe();

    const applicationsChannel = supabase
      .channel("admin-applications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "applications" }, () => {
        const newActivity: LiveActivity = {
          id: crypto.randomUUID(),
          type: "application",
          message: "New job application submitted",
          timestamp: new Date().toISOString(),
        };
        setActivities((prev) => [newActivity, ...prev.slice(0, 49)]);
        fetchMetrics();
      })
      .subscribe();

    const jobsChannel = supabase
      .channel("admin-jobs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "jobs" }, () => {
        const newActivity: LiveActivity = {
          id: crypto.randomUUID(),
          type: "job_posted",
          message: "New job posted",
          timestamp: new Date().toISOString(),
        };
        setActivities((prev) => [newActivity, ...prev.slice(0, 49)]);
        fetchMetrics();
      })
      .subscribe();

    const tailorChannel = supabase
      .channel("admin-tailor")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tailor_runs" }, () => {
        const newActivity: LiveActivity = {
          id: crypto.randomUUID(),
          type: "tailor_run",
          message: "Tailor resume generated",
          timestamp: new Date().toISOString(),
        };
        setActivities((prev) => [newActivity, ...prev.slice(0, 49)]);
        fetchMetrics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(applicationsChannel);
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(tailorChannel);
    };
  };

  useEffect(() => {
    fetchMetrics();
    const unsubscribe = subscribeToChanges();

    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 bg-gray-700 rounded"></div>
        <div className="grid grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time platform overview • Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Activity className="h-4 w-4 text-green-400" />
          Live Updates Active
        </div>
      </div>

      {/* Today's Stats */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Today&apos;s Activity</h2>
        <div className="grid grid-cols-3 gap-6">
          <MetricCard
            title="Signups Today"
            value={metrics.signupsToday}
            icon={UserPlus}
            color="green"
          />
          <MetricCard
            title="Applications Today"
            value={metrics.applicationsToday}
            icon={FileText}
            color="blue"
          />
          <MetricCard
            title="Jobs Posted Today"
            value={metrics.jobsPostedToday}
            icon={Briefcase}
            color="purple"
          />
        </div>
      </div>

      {/* Main Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Platform Metrics</h2>
        <div className="grid grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers}
            icon={Users}
            color="purple"
          />
          <MetricCard
            title="Candidates"
            value={metrics.totalCandidates}
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Employers"
            value={metrics.totalEmployers}
            icon={Building}
            color="green"
          />
          <MetricCard
            title="Tailor Runs"
            value={metrics.totalTailorRuns}
            icon={Sparkles}
            color="yellow"
          />
          <MetricCard
            title="Total Jobs"
            value={metrics.totalJobs}
            icon={Briefcase}
            color="purple"
          />
          <MetricCard
            title="Published Jobs"
            value={metrics.publishedJobs}
            icon={CheckCircle}
            color="green"
          />
          <MetricCard
            title="Total Applications"
            value={metrics.totalApplications}
            icon={FileText}
            color="blue"
          />
          <MetricCard
            title="Pending Reviews"
            value={metrics.pendingApplications}
            icon={Clock}
            color="yellow"
          />
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-3 gap-6">
        <MetricCard
          title="Total Job Views"
          value={metrics.totalJobViews}
          icon={Eye}
          color="blue"
        />
        <div className="col-span-2">
          <LiveActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}
