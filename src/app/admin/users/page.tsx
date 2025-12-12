"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, Search, Filter, MoreVertical, Shield, Briefcase, User } from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  user_type: "candidate" | "employer" | "admin";
  first_name: string | null;
  last_name: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "candidate" | "employer" | "admin">("all");

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient();
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
      
      if (filter !== "all") {
        query = query.eq("user_type", filter);
      }
      
      const { data } = await query;
      setUsers(data || []);
      setLoading(false);
    };
    fetchUsers();
  }, [filter]);

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case "admin": return <Shield className="h-4 w-4 text-purple-400" />;
      case "employer": return <Briefcase className="h-4 w-4 text-green-400" />;
      default: return <User className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-400 text-sm mt-1">{users.length} total users</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Types</option>
          <option value="candidate">Candidates</option>
          <option value="employer">Employers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">User</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Type</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Joined</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><div className="h-4 w-48 bg-gray-700 rounded animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-700 rounded animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-700 rounded animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-28 bg-gray-700 rounded animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-8 bg-gray-700 rounded animate-pulse ml-auto" /></td>
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.email}
                      </p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getUserTypeIcon(user.user_type)}
                      <span className="text-gray-300 capitalize">{user.user_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.onboarding_completed
                        ? "bg-green-600/20 text-green-400"
                        : "bg-yellow-600/20 text-yellow-400"
                    }`}>
                      {user.onboarding_completed ? "Active" : "Onboarding"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
