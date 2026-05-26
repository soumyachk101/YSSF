"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface CampaignCardProps {
  title: string;
  category: string;
  description: string;
  raised: number;
  goal: number;
  imageSrc: string;
  accentClass?: string;
  progressColor?: string;
  delay?: number;
}

export default function CampaignCard({
  title,
  category,
  description,
  raised,
  goal,
  imageSrc,
  accentClass = "text-primary-900",
  progressColor = "bg-primary-900",
  delay = 0,
}: CampaignCardProps) {
  const progressPercent = Math.min(Math.round((raised / goal) * 100), 100);

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="yssf-card overflow-hidden flex flex-col h-full border border-primary-200/40 bg-white"
    >
      {/* Campaign Image */}
      <div className="relative h-48 w-full overflow-hidden bg-primary-200/20">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-primary-900/10 px-3 py-1 rounded-full text-xs font-heading font-semibold text-primary-900">
          {category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-heading font-extrabold text-xl text-primary-900 mb-2 leading-tight">
          {title}
        </h3>
        
        <p className="font-sans text-sm text-foreground/80 leading-relaxed mb-6 flex-grow">
          {description}
        </p>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs font-heading font-semibold text-primary-900/80">
            <span>Progress: {progressPercent}%</span>
            <span>Goal: {formatCurrency(goal)}</span>
          </div>
          <div className="w-full h-3 bg-surface-100 rounded-full overflow-hidden border border-primary-200/20">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${progressPercent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
              className={`h-full ${progressColor} rounded-full`}
            />
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-xs font-sans text-foreground/70">Raised</span>
            <span className={`text-sm font-heading font-bold ${accentClass}`}>{formatCurrency(raised)}</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <Link
            href="/register?role=volunteer"
            className="px-4 py-2 border-2 border-primary-900 text-primary-900 hover:bg-surface-100 font-heading font-semibold text-xs rounded-xl text-center transition-colors"
          >
            Volunteer
          </Link>
          <a
            href="#donate"
            className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-primary-900 border-2 border-primary-900/10 font-heading font-bold text-xs rounded-xl text-center transition-all shadow-sm shadow-accent-500/10 hover:shadow-md"
          >
            Donate
          </a>
        </div>
      </div>
    </motion.div>
  );
}
