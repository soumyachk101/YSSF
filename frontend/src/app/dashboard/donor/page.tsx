"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  TrendingUp,
  Receipt,
  Calendar,
  Download,
  ArrowUpRight,
} from "lucide-react";
import { apiGetDashboardStats, apiGetDonationHistory, type DashboardStatsResponse } from "@/lib/api";

interface DonationWithCampaign {
  id: string;
  amount: number;
  createdAt: string | Date;
  campaign?: { id: string; title: string; goal?: number; raised?: number; status?: string } | null;
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function DonorSkeleton() {
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
              <div className="h-8 w-20 bg-surface-100 rounded mx-auto animate-pulse" />
              <div className="h-4 w-24 bg-surface-100 rounded mx-auto mt-2 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <div className="h-6 w-36 bg-surface-100 rounded animate-pulse mb-4" />
            <div className="h-64 bg-surface-100/50 rounded-2xl animate-pulse" />
          </div>
          <div className="lg:col-span-5">
            <div className="h-6 w-36 bg-surface-100 rounded animate-pulse mb-4" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-surface-100/50 rounded-2xl animate-pulse mb-4" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DonorDashboardPage() {
  const router = useRouter();
  const [dashData, setDashData] = useState<DashboardStatsResponse | null>(null);
  const [donations, setDonations] = useState<DonationWithCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiGetDashboardStats(), apiGetDonationHistory()])
      .then(([stats, history]) => {
        if (!stats) {
          router.push("/login");
          return;
        }
        setDashData(stats);
        setDonations(history);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading donor dashboard stats:", err);
        router.push("/login?error=load_failed");
      });
  }, [router]);

  if (loading) return <DonorSkeleton />;
  if (!dashData) return null;

  const DONOR_STATS = [
    { label: "Total Donated", value: formatCurrency(dashData.stats.totalDonated), icon: Heart, color: "text-alert-500" },
    { label: "Campaigns Supported", value: String(new Set(donations.filter((d) => d.campaign).map((d) => d.campaign!.id)).size), icon: TrendingUp, color: "text-primary-900" },
    { label: "Total Donations", value: String(donations.length), icon: Receipt, color: "text-accent-600" },
    { label: "Impact Score", value: String(dashData.stats.impactScore), icon: Calendar, color: "text-primary-700" },
  ];

  const activeCampaigns = Array.from(
    donations.reduce((map, d) => {
      if (d.campaign) {
        const existing = map.get(d.campaign.id);
        if (existing) {
          existing.raised += d.amount;
        } else {
          map.set(d.campaign.id, { ...d.campaign, raised: d.amount });
        }
      }
      return map;
    }, new Map<string, { id: string; title: string; goal?: number; raised: number; status?: string }>())
  ).map(([, v]) => v);

  const campaignColors = ["bg-primary-900", "bg-alert-500", "bg-accent-500", "bg-primary-700", "bg-warning-500"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-100/40 via-white to-surface-100/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-primary-900 font-heading font-semibold text-sm hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-alert-500/10 text-alert-500">
              <Heart className="w-6 h-6" />
            </div>
            <span className="font-display font-semibold text-primary-700 uppercase tracking-widest text-sm">Donor Dashboard</span>
          </div>
          <h1 className="font-heading font-extrabold text-4xl text-primary-900 leading-tight">
            Your <span className="handwritten-highlight inline-block font-handwritten text-accent-500">Contributions</span>
          </h1>
          <p className="font-sans text-foreground/80 mt-2">Track your donations, download tax receipts, and see your impact.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {DONOR_STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="yssf-card p-5 bg-white border-primary-200/40 text-center">
                <Icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                <p className="font-heading font-extrabold text-2xl text-primary-900">{stat.value}</p>
                <p className="font-sans text-xs text-foreground/60 mt-1">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Donation History */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-7">
            <h2 className="font-heading font-extrabold text-xl text-primary-900 mb-4">Donation History</h2>
            <div className="yssf-card overflow-hidden bg-white border-primary-200/40">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary-100">
                      <th className="text-left p-4 font-heading font-bold text-xs text-primary-900/70 uppercase tracking-wider">Date</th>
                      <th className="text-left p-4 font-heading font-bold text-xs text-primary-900/70 uppercase tracking-wider">Campaign</th>
                      <th className="text-right p-4 font-heading font-bold text-xs text-primary-900/70 uppercase tracking-wider">Amount</th>
                      <th className="text-center p-4 font-heading font-bold text-xs text-primary-900/70 uppercase tracking-wider">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.length > 0 ? donations.map((donation, i) => (
                      <tr key={donation.id || i} className="border-b border-primary-100/50 last:border-0">
                        <td className="p-4 font-sans text-sm text-foreground/80">{formatDate(donation.createdAt)}</td>
                        <td className="p-4 font-heading font-semibold text-sm text-primary-900">{donation.campaign?.title || "General Donation"}</td>
                        <td className="p-4 text-right font-heading font-bold text-sm text-primary-900">{formatCurrency(donation.amount)}</td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary-900/10 text-primary-900 text-xs font-heading font-semibold">
                            <Receipt className="w-3 h-3" /> Issued
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="p-6 text-center font-sans text-sm text-foreground/60">No donations yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Active Campaigns + Tax Certificate */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="font-heading font-extrabold text-xl text-primary-900 mb-4">Campaigns You&apos;ve Supported</h2>
              {activeCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {activeCampaigns.map((campaign, i) => {
                    const percent = campaign.goal ? Math.round((campaign.raised / campaign.goal) * 100) : 0;
                    return (
                      <div key={campaign.id} className="yssf-card p-4 bg-white border-primary-200/30">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-heading font-bold text-sm text-primary-900">{campaign.title}</h3>
                          {campaign.goal && campaign.goal > 0 && <span className="font-heading font-bold text-xs text-primary-900/70">{percent}%</span>}
                        </div>
                        {campaign.goal && campaign.goal > 0 && (
                          <>
                            <div className="w-full h-2.5 bg-surface-100 rounded-full overflow-hidden mb-1">
                              <motion.div initial={{ width: 0 }} whileInView={{ width: `${percent}%` }} viewport={{ once: true }} transition={{ duration: 1 }} className={`h-full ${campaignColors[i % campaignColors.length]} rounded-full`} />
                            </div>
                            <p className="font-sans text-[10px] text-foreground/50">{formatCurrency(campaign.raised)} of {formatCurrency(campaign.goal)}</p>
                          </>
                        )}
                        {(!campaign.goal || campaign.goal === 0) && (
                          <p className="font-sans text-xs text-foreground/60">Your contribution: {formatCurrency(campaign.raised)}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white border border-primary-200/30 text-center">
                  <p className="font-sans text-sm text-foreground/60">No campaign donations yet.</p>
                </div>
              )}
            </motion.div>

            {/* Tax Certificate Download */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="yssf-card p-6 bg-primary-900 text-white">
              <Receipt className="w-8 h-8 text-accent-500 mb-3" />
              <h3 className="font-heading font-extrabold text-lg mb-2">80G Tax Certificate</h3>
              <p className="font-sans text-sm text-primary-200 mb-4">Download your tax exemption certificate for the current financial year.</p>
              <button className="w-full py-3 bg-accent-500 hover:bg-accent-600 text-primary-900 font-heading font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Download className="w-4 h-4" /> Download Certificate
              </button>
            </motion.div>

            {/* Make a Donation CTA */}
            <Link href="/campaigns" className="flex items-center justify-between p-5 rounded-2xl bg-accent-500/10 border-2 border-accent-500/30 hover:border-accent-500 transition-all group">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-accent-600" />
                <div>
                  <p className="font-heading font-bold text-sm text-primary-900">Make Another Donation</p>
                  <p className="font-sans text-xs text-foreground/60">Browse active campaigns</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-primary-900/40 group-hover:text-primary-900 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
