"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  LayoutDashboard,
  Calendar,
  Heart,
  Clock,
  TrendingUp,
  Leaf,
  BarChart3,
  ArrowRight,
  FileText,
  Shield,
  LogIn,
} from "lucide-react";
import { apiGetDashboardStats, type DashboardStatsResponse } from "@/lib/api";

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

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-100/40 via-white to-surface-100/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-5 w-28 bg-surface-100 rounded animate-pulse mb-8" />
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-surface-100 animate-pulse" />
            <div className="h-4 w-24 bg-surface-100 rounded animate-pulse" />
          </div>
          <div className="h-10 w-80 bg-surface-100 rounded animate-pulse mb-2" />
          <div className="h-5 w-64 bg-surface-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="yssf-card p-5 bg-white border-primary-200/40 text-center">
              <div className="w-9 h-9 rounded-full bg-surface-100 mx-auto mb-2 animate-pulse" />
              <div className="h-8 w-20 bg-surface-100 rounded mx-auto animate-pulse" />
              <div className="h-4 w-24 bg-surface-100 rounded mx-auto mt-2 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-3">
            <div className="h-6 w-36 bg-surface-100 rounded animate-pulse mb-4" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-surface-100/50 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="lg:col-span-5 space-y-3">
            <div className="h-6 w-28 bg-surface-100 rounded animate-pulse mb-4" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-surface-100/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const QUICK_LINKS = [
  { label: "View Upcoming Events", href: "/events", icon: Calendar },
  { label: "Browse Campaigns", href: "/campaigns", icon: BarChart3 },
  { label: "View Gallery", href: "/gallery", icon: Leaf },
  { label: "Read Blog", href: "/blog", icon: FileText },
  { label: "Transparency", href: "/transparency", icon: Shield },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetDashboardStats()
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading general dashboard stats:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-surface-100/40 via-white to-surface-100/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/" className="inline-flex items-center gap-2 text-primary-900 font-heading font-semibold text-sm hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="p-4 rounded-full bg-primary-900/10 text-primary-900 mb-6">
              <LogIn className="w-10 h-10" />
            </div>
            <h1 className="font-heading font-extrabold text-3xl text-primary-900 mb-3">Sign in to View Your Dashboard</h1>
            <p className="font-sans text-foreground/70 mb-8 max-w-md">
              Log in to see your donation history, event registrations, volunteer stats, and impact score.
            </p>
            <Link href="/login" className="px-8 py-3 bg-primary-900 hover:bg-primary-800 text-white font-heading font-bold rounded-xl transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const QUICK_STATS = [
    { label: "Events Attended", value: String(data.stats.eventsAttended), icon: Calendar, color: "text-primary-900", bg: "bg-primary-900/10" },
    { label: "Total Donated", value: formatCurrency(data.stats.totalDonated), icon: Heart, color: "text-alert-500", bg: "bg-alert-500/10" },
    { label: "Volunteer Hours", value: String(data.stats.volunteerHours), icon: Clock, color: "text-primary-700", bg: "bg-primary-700/10" },
    { label: "Impact Score", value: String(data.stats.impactScore), icon: TrendingUp, color: "text-accent-600", bg: "bg-accent-500/10" },
  ];

  const recentActivity: { action: string; target: string; time: string; icon: typeof Calendar }[] = [
    ...data.recentDonations.map((d) => ({
      action: `Donated ${formatCurrency(d.amount)} to`,
      target: d.campaign?.title || "General Donation",
      time: timeAgo(d.createdAt),
      icon: Heart,
    })),
    ...data.recentRegistrations.map((r) => ({
      action: "Registered for",
      target: r.event.title,
      time: timeAgo(r.createdAt),
      icon: Calendar,
    })),
  ].sort((a, b) => {
    const timeOrder: Record<string, number> = { "just now": 0 };
    return (timeOrder[a.time] ?? 999) - (timeOrder[b.time] ?? 999);
  }).slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-100/40 via-white to-surface-100/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-primary-900 font-heading font-semibold text-sm hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary-900/10 text-primary-900">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <span className="font-display font-semibold text-primary-700 uppercase tracking-widest text-sm">
              Dashboard
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-4xl text-primary-900 leading-tight">
            Welcome back, <span className="handwritten-highlight inline-block font-handwritten text-accent-500">{data.user.name || "Friend"}</span>
          </h1>
          <p className="font-sans text-foreground/80 mt-2">
            Here&apos;s an overview of your YSSF ecosystem activity.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {QUICK_STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="yssf-card p-5 bg-white border-primary-200/40 text-center"
              >
                <div className={`inline-flex p-2 rounded-full ${stat.bg} ${stat.color} mb-2`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-heading font-extrabold text-2xl text-primary-900">{stat.value}</p>
                <p className="font-sans text-xs text-foreground/60 mt-1">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7"
          >
            <h2 className="font-heading font-extrabold text-xl text-primary-900 mb-4">Recent Activity</h2>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-primary-200/30">
                      <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center text-primary-900 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-sans text-sm text-foreground/80 truncate">
                          {item.action} <strong className="text-primary-900">{item.target}</strong>
                        </p>
                        <p className="font-sans text-[11px] text-foreground/50">{item.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white border border-primary-200/30 text-center">
                <p className="font-sans text-sm text-foreground/60">No recent activity yet. Start by donating or registering for an event!</p>
              </div>
            )}
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-5"
          >
            <h2 className="font-heading font-extrabold text-xl text-primary-900 mb-4">Quick Links</h2>
            <div className="space-y-3">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-primary-200/30 hover:border-primary-400 hover:bg-surface-100/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-900/10 flex items-center justify-center text-primary-900">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-heading font-bold text-sm text-primary-900">{link.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary-900/40 group-hover:text-primary-900 transition-colors" />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
