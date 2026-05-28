"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  Award,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { apiGetDashboardStats, type DashboardStatsResponse } from "@/lib/api";

function VolunteerSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-100/40 via-white to-surface-100/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-5 w-28 bg-surface-100 rounded animate-pulse mb-8" />
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-surface-100 animate-pulse" />
            <div className="h-4 w-32 bg-surface-100 rounded animate-pulse" />
          </div>
          <div className="h-10 w-72 bg-surface-100 rounded animate-pulse mb-2" />
          <div className="h-5 w-80 bg-surface-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="yssf-card p-5 bg-white border-primary-200/40 text-center">
              <div className="w-5 h-5 bg-surface-100 mx-auto mb-2 animate-pulse" />
              <div className="h-8 w-16 bg-surface-100 rounded mx-auto animate-pulse" />
              <div className="h-4 w-24 bg-surface-100 rounded mx-auto mt-2 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-3">
            <div className="h-6 w-40 bg-surface-100 rounded animate-pulse mb-4" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-surface-100/50 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="lg:col-span-5 space-y-10">
            <div>
              <div className="h-6 w-24 bg-surface-100 rounded animate-pulse mb-4" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-24 bg-surface-100 rounded-full animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SKILLS = ["Tree Plantation", "First Aid", "Event Coordination", "Public Speaking", "Teaching", "Social Media"];

export default function VolunteerDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetDashboardStats()
      .then((result) => {
        if (!result) {
          router.push("/login");
          return;
        }
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading volunteer dashboard stats:", err);
        router.push("/login?error=load_failed");
      });
  }, [router]);

  if (loading) return <VolunteerSkeleton />;

  if (!data) return null;

  const VOLUNTEER_STATS = [
    { label: "Events Joined", value: String(data.stats.eventsAttended), icon: Calendar },
    { label: "Hours Volunteered", value: String(data.stats.volunteerHours), icon: Clock },
    { label: "Impact Score", value: String(data.stats.impactScore), icon: Award },
    { label: "Total Donated", value: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(data.stats.totalDonated), icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-100/40 via-white to-surface-100/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-primary-900 font-heading font-semibold text-sm hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary-900/10 text-primary-900">
              <Users className="w-6 h-6" />
            </div>
            <span className="font-display font-semibold text-primary-700 uppercase tracking-widest text-sm">Volunteer Dashboard</span>
          </div>
          <h1 className="font-heading font-extrabold text-4xl text-primary-900 leading-tight">
            Welcome, <span className="handwritten-highlight inline-block font-handwritten text-accent-500">{data.user.name || "Volunteer"}</span>
          </h1>
          <p className="font-sans text-foreground/80 mt-2">Track your volunteer journey, upcoming events, and earned badges.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {VOLUNTEER_STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="yssf-card p-5 bg-white border-primary-200/40 text-center">
                <Icon className="w-5 h-5 text-primary-900 mx-auto mb-2" />
                <p className="font-heading font-extrabold text-2xl text-primary-900">{stat.value}</p>
                <p className="font-sans text-xs text-foreground/60 mt-1">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-10">
            {/* Registered Events */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="font-heading font-extrabold text-xl text-primary-900 mb-4">Your Registered Events</h2>
              {data.recentRegistrations.length > 0 ? (
                <div className="space-y-3">
                  {data.recentRegistrations.map((reg, i) => (
                    <div key={reg.id || i} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-primary-200/30">
                      <div>
                        <h3 className="font-heading font-bold text-sm text-primary-900">{reg.event.title}</h3>
                        {reg.event.date && (
                          <p className="font-sans text-xs text-foreground/60 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" /> {reg.event.date}
                            {reg.event.location && <><span className="mx-1">·</span><MapPin className="w-3 h-3" /> {reg.event.location}</>}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-heading font-bold ${
                        reg.status === "CONFIRMED" ? "bg-primary-900 text-white" :
                        reg.status === "COMPLETED" ? "bg-primary-700 text-white" :
                        "bg-accent-500 text-primary-900"
                      }`}>
                        {reg.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white border border-primary-200/30 text-center">
                  <p className="font-sans text-sm text-foreground/60">No event registrations yet. Browse upcoming events to get started!</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-10">
            {/* Skills */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="font-heading font-extrabold text-xl text-primary-900 mb-4">Your Skills</h2>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 rounded-full bg-primary-900/10 text-primary-900 text-xs font-heading font-semibold border border-primary-900/15">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Achievement Badges */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="font-heading font-extrabold text-xl text-primary-900 mb-4">Achievement Badges</h2>
              <div className="p-6 rounded-2xl bg-white border border-primary-200/30 text-center">
                <CheckCircle2 className="w-8 h-8 text-primary-900 mx-auto mb-2" />
                <p className="font-heading font-bold text-sm text-primary-900">Keep Volunteering!</p>
                <p className="font-sans text-xs text-foreground/60 mt-1">
                  You&apos;ve attended {data.stats.eventsAttended} event{data.stats.eventsAttended !== 1 ? "s" : ""} and logged {data.stats.volunteerHours} volunteer hours. Badges unlock as you hit milestones!
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
