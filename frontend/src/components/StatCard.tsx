"use client";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";

interface StatCardProps {
  iconName: keyof typeof LucideIcons;
  value: string;
  label: string;
  description: string;
  accentColor?: string;
  delay?: number;
}

export default function StatCard({
  iconName,
  value,
  label,
  description,
  accentColor = "text-primary-900",
  delay = 0,
}: StatCardProps) {
  // Dynamically resolve icon component
  const IconComponent = LucideIcons[iconName] as React.ComponentType<{ className?: string }>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.03, translateY: -4 }}
      className="yssf-card p-6 flex flex-col items-center text-center bg-white border-2 border-primary-200/40 relative overflow-hidden group"
    >
      {/* Background soft tint hover effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface-100/10 to-primary-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      
      <div className={`p-4 rounded-full bg-surface-100 ${accentColor} mb-4 transition-all duration-300 group-hover:scale-110`}>
        {IconComponent && <IconComponent className="w-8 h-8" />}
      </div>
      
      <h3 className="font-heading font-extrabold text-3xl text-primary-900 leading-tight mb-1">
        {value}
      </h3>
      
      <h4 className="font-display font-semibold text-lg text-primary-700 mb-2">
        {label}
      </h4>
      
      <p className="font-sans text-sm text-foreground/80 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
