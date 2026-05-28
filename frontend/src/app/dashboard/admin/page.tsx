"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Eye,
  Settings,
} from "lucide-react";
import { apiGetAdminStats, apiGetAllUsers, type AdminStatsResponse, type UserProfile } from "@/lib/api";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
}

function timeAgo(date: string | Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-5 w-28 bg-slate-100 rounded animate-pulse mb-8" />
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="h-10 w-80 bg-slate-100 rounded animate-pulse mb-2" />
          <div className="h-5 w-96 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="yssf-card p-5 bg-white border-slate-200/60 text-center">
              <div className="w-5 h-5 bg-slate-100 mx-auto mb-2 animate-pulse" />
              <div className="h-8 w-16 bg-slate-100 rounded mx-auto animate-pulse" />
              <div className="h-4 w-24 bg-slate-100 rounded mx-auto mt-2 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="yssf-card p-5 bg-white border-slate-200/60 h-24 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <div className="h-6 w-36 bg-slate-100 rounded animate-pulse mb-4" />
            <div className="h-64 bg-slate-100/50 rounded-2xl animate-pulse" />
          </div>
          <div className="lg:col-span-5 space-y-8">
            <div className="h-6 w-44 bg-slate-100 rounded animate-pulse mb-4" />
            {[1, 2].map((i) => (
              <div key={i} className="h-28 bg-slate-100/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  { label: "Approve NGO", icon: CheckCircle2, desc: "Review pending NGO partner applications" },
  { label: "Moderate Content", icon: Eye, desc: "Review blog posts and event submissions" },
  { label: "View Reports", icon: FileText, desc: "Access financial and impact reports" },
  { label: "Platform Settings", icon: Settings, desc: "Configure platform-wide settings" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiGetAdminStats(), apiGetAllUsers()])
      .then(([adminStats, allUsers]) => {
        if (!adminStats) {
          router.push("/login");
          return;
        }
        setStats(adminStats);
        setUsers(allUsers);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading admin dashboard stats:", err);
        router.push("/login?error=load_failed");
      });
  }, [router]);

  if (loading) return <AdminSkeleton />;
  if (!stats) return null;

  const PLATFORM_STATS = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString("en-IN"), icon: Users, color: "text-primary-900" },
    { label: "Active Campaigns", value: String(stats.activeCampaigns), icon: TrendingUp, color: "text-accent-600" },
    { label: "Pending Verifications", value: String(stats.pendingVerifications), icon: AlertTriangle, color: "text-warning-500" },
    { label: "Total Donations", value: formatCurrency(stats.totalDonations), icon: TrendingUp, color: "text-primary-700" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-700 font-heading font-semibold text-sm hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-slate-700/10 text-slate-700">
              <Shield className="w-6 h-6" />
            </div>
            <span className="font-display font-semibold text-slate-600 uppercase tracking-widest text-sm">Admin Panel</span>
          </div>
          <h1 className="font-heading font-extrabold text-4xl text-slate-900 leading-tight">
            Platform <span className="handwritten-highlight inline-block font-handwritten text-accent-500">Administration</span>
          </h1>
          <p className="font-sans text-slate-600 mt-2">Manage users, verify NGOs, review donations, and monitor platform health.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {PLATFORM_STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="yssf-card p-5 bg-white border-slate-200/60 text-center">
                <Icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                <p className="font-heading font-extrabold text-2xl text-slate-900">{stat.value}</p>
                <p className="font-sans text-xs text-slate-500 mt-1">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
          <h2 className="font-heading font-extrabold text-xl text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.label} className="yssf-card p-5 bg-white border-slate-200/60 text-left hover:border-slate-400 transition-colors cursor-pointer group">
                  <Icon className="w-6 h-6 text-slate-700 mb-3 group-hover:text-slate-900 transition-colors" />
                  <h3 className="font-heading font-bold text-sm text-slate-900 mb-1">{action.label}</h3>
                  <p className="font-sans text-xs text-slate-500">{action.desc}</p>
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* User Management */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-7">
            <h2 className="font-heading font-extrabold text-xl text-slate-900 mb-4">User Management</h2>
            <div className="yssf-card overflow-hidden bg-white border-slate-200/60">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left p-4 font-heading font-bold text-xs text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="text-left p-4 font-heading font-bold text-xs text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="text-center p-4 font-heading font-bold text-xs text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="text-right p-4 font-heading font-bold text-xs text-slate-500 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? users.slice(0, 10).map((user) => {
                      const role = user.profile?.role || user.role || "User";
                      return (
                        <tr key={user.id} className="border-b border-slate-100/50 last:border-0">
                          <td className="p-4">
                            <p className="font-heading font-semibold text-sm text-slate-900">{user.name || "Unnamed"}</p>
                            <p className="font-sans text-xs text-slate-500">{user.email}</p>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-heading font-bold ${
                              role === "ADMIN" ? "bg-slate-700 text-white" :
                              role === "VOLUNTEER" ? "bg-primary-900 text-white" :
                              role === "DONOR" ? "bg-accent-500 text-slate-900" :
                              "bg-primary-700 text-white"
                            }`}>
                              {role}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1 text-xs font-heading font-semibold text-primary-900">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </span>
                          </td>
                          <td className="p-4 text-right font-sans text-xs text-slate-500">{formatDate(user.createdAt)}</td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={4} className="p-6 text-center font-sans text-sm text-slate-500">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-5 space-y-8">
            {/* Pending Verifications */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h2 className="font-heading font-extrabold text-xl text-slate-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning-500" /> Pending Verifications
              </h2>
              {stats.pendingVerifications > 0 ? (
                <div className="yssf-card p-4 bg-white border-warning-500/20">
                  <p className="font-heading font-bold text-sm text-slate-900 mb-1">{stats.pendingVerifications} pending registration{stats.pendingVerifications !== 1 ? "s" : ""}</p>
                  <p className="font-sans text-xs text-slate-500 mb-3">Review and approve event registrations awaiting verification.</p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-primary-900 hover:bg-primary-800 text-white font-heading font-bold text-xs rounded-xl cursor-pointer transition-colors">
                      Review All
                    </button>
                  </div>
                </div>
              ) : (
                <div className="yssf-card p-4 bg-white border-slate-200/60 text-center">
                  <CheckCircle2 className="w-6 h-6 text-primary-900 mx-auto mb-2" />
                  <p className="font-sans text-sm text-slate-500">All clear! No pending verifications.</p>
                </div>
              )}
            </motion.div>

            {/* Recent Donations */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h2 className="font-heading font-extrabold text-xl text-slate-900 mb-4">Recent Donations</h2>
              {stats.recentDonations.length > 0 ? (
                <div className="space-y-2">
                  {stats.recentDonations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="font-heading font-semibold text-sm text-slate-900">Donation</p>
                        <p className="font-sans text-[10px] text-slate-500">{donation.campaign?.title || "General"} · {timeAgo(donation.createdAt)}</p>
                      </div>
                      <p className="font-heading font-bold text-sm text-primary-900">{formatCurrency(donation.amount)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <p className="font-sans text-sm text-slate-500">No donations yet.</p>
                </div>
              )}
            </motion.div>

            {/* Recent Users */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <h2 className="font-heading font-extrabold text-xl text-slate-900 mb-4">Recent Users</h2>
              {stats.recentUsers.length > 0 ? (
                <div className="space-y-2">
                  {stats.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="font-heading font-semibold text-sm text-slate-900">{user.name || "Unnamed"}</p>
                        <p className="font-sans text-[10px] text-slate-500">{user.email} · {timeAgo(user.createdAt)}</p>
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-heading font-bold ${
                        user.profile?.role === "ADMIN" ? "bg-slate-700 text-white" :
                        user.profile?.role === "VOLUNTEER" ? "bg-primary-900 text-white" :
                        user.profile?.role === "DONOR" ? "bg-accent-500 text-slate-900" :
                        "bg-primary-700 text-white"
                      }`}>
                        {user.profile?.role || "User"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <p className="font-sans text-sm text-slate-500">No recent users.</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
