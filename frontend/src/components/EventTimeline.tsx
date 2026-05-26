"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Clock, Users } from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  schoolPartner: string;
  description: string;
  imageSrc: string;
  badge: string;
  badgeColor: string;
}

const EVENTS: EventItem[] = [
  {
    id: "1",
    title: "Eco-Restoration Plantation Drive",
    date: "June 05, 2026",
    time: "09:00 AM - 01:00 PM",
    location: "Barjora, Bankura District",
    schoolPartner: "Barjora High School",
    description: "Planting 1,000+ native saplings in partnership with students to restore local greenery and combat soil erosion.",
    imageSrc: "/Assets/Borjora_HS_01.png",
    badge: "Environment",
    badgeColor: "bg-primary-900 text-white border-primary-400",
  },
  {
    id: "2",
    title: "Sakti Life-Saving Blood Camp",
    date: "June 14, 2026",
    time: "10:00 AM - 04:00 PM",
    location: "Narayana Healthcare Center, Kolkata",
    schoolPartner: "Narayana Group",
    description: "Annual blood collection drive in collaboration with local medical authorities to replenish emergency blood banks.",
    imageSrc: "/Assets/narayana_01.png",
    badge: "Health Camp",
    badgeColor: "bg-alert-500 text-white border-alert-500",
  },
  {
    id: "3",
    title: " DPS Green Workshop & Seminars",
    date: "June 22, 2026",
    time: "11:00 AM - 02:00 PM",
    location: "DPS Auditorium, Salt Lake",
    schoolPartner: "Delhi Public School",
    description: "Empowering young students through hands-on seminars on waste segregation, biodiversity, and eco-friendly lifestyles.",
    imageSrc: "/Assets/dps_01.png",
    badge: "Education",
    badgeColor: "bg-accent-500 text-primary-900 border-accent-500",
  },
  {
    id: "4",
    title: "Community Cleanliness Campaign",
    date: "July 01, 2026",
    time: "07:30 AM - 11:30 AM",
    location: "St Michael's Grounds and Suburbs",
    schoolPartner: "St Michael's School",
    description: "A community cleanup and sanitization campaign to create awareness around plastic pollution and community hygiene.",
    imageSrc: "/Assets/st_michale_01.png",
    badge: "Sanitation",
    badgeColor: "bg-primary-400 text-primary-900 border-primary-400",
  },
  {
    id: "5",
    title: "Youth Leadership Sakti Camp",
    date: "July 12, 2026",
    time: "09:00 AM - 05:00 PM",
    location: "St Peter's Campus, Kolkata",
    schoolPartner: "St Peter's Academy",
    description: "Developing youth leadership skills for community development, emergency response, and peer-to-peer mental health support.",
    imageSrc: "/Assets/st_peters_01.png",
    badge: "Youth Sakti",
    badgeColor: "bg-warning-500 text-white border-warning-500",
  },
];

export default function EventTimeline() {
  return (
    <div className="relative">
      {/* Central timeline line for desktop */}
      <div className="absolute left-1/2 transform -translate-x-1/2 top-4 bottom-4 w-1 bg-primary-200/50 hidden md:block border-l border-dashed border-primary-900/20" />

      <div className="space-y-12 relative">
        {EVENTS.map((event, index) => {
          const isLeft = index % 2 === 0;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className={`flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0 relative ${
                isLeft ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Central Leaf Pin */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-white border-4 border-primary-900 shadow-md hidden md:flex items-center justify-center z-10 transition-transform duration-300 hover:scale-125 hover:border-accent-500">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-400" />
              </div>

              {/* Event Content Side */}
              <div className="w-full md:w-[45%]">
                <div className="yssf-card overflow-hidden bg-white border border-primary-200/30">
                  {/* Image banner */}
                  <div className="relative h-48 w-full bg-primary-900/5">
                    <Image
                      src={event.imageSrc}
                      alt={event.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 45vw"
                      className="object-cover"
                    />
                    <div className={`absolute top-4 left-4 border px-3 py-1 rounded-full text-xs font-heading font-bold shadow-sm ${event.badgeColor}`}>
                      {event.badge}
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="p-6">
                    <h3 className="font-heading font-extrabold text-xl text-primary-900 mb-2 leading-tight">
                      {event.title}
                    </h3>
                    <p className="font-display font-medium text-sm text-primary-700 mb-4 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-accent-500" /> Partner: {event.schoolPartner}
                    </p>
                    <p className="font-sans text-sm text-foreground/80 leading-relaxed mb-6">
                      {event.description}
                    </p>

                    <div className="border-t border-primary-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-foreground/75 font-sans">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary-900" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-900" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <MapPin className="w-4 h-4 text-primary-900" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Link
                        href={`/register?role=volunteer&event=${encodeURIComponent(event.title)}`}
                        className="px-5 py-2 bg-primary-900 hover:bg-primary-800 text-white font-heading font-semibold text-xs rounded-xl transition-all shadow-md shadow-primary-900/10 hover:shadow-lg"
                      >
                        Register to Volunteer
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spacing card for layout balance on large displays */}
              <div className="w-full md:w-[45%] hidden md:block" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
