"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "Events", href: "/events" },
  { label: "Blog", href: "/blog" },
  { label: "Gallery", href: "/gallery" },
  { label: "Calendar", href: "/calendar" },
  { label: "Contact", href: "/contact" },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname.startsWith("/auth");

  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-primary-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-10 h-10 bg-primary-900 rounded-full flex items-center justify-center text-accent-500 font-display text-xl font-bold border-2 border-primary-400 group-hover:scale-105 transition-transform duration-300">
            YS
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-primary-900 text-lg leading-none tracking-tight">YOUTH SAKTI</span>
            <span className="font-display font-medium text-primary-900/70 text-sm tracking-wide">Social Foundation</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-heading font-medium text-primary-900/80 hover:text-primary-900 hover:underline underline-offset-4 decoration-accent-500 decoration-2 transition-colors text-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:inline-flex px-4 py-2 font-heading font-semibold text-sm text-primary-900 hover:text-primary-700 transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="hidden sm:inline-flex px-5 py-2.5 bg-primary-900 hover:bg-primary-800 text-white font-heading font-semibold text-sm rounded-xl transition-all shadow-md shadow-primary-900/10 hover:shadow-lg hover:shadow-primary-900/20 hover:-translate-y-0.5">
            Join As Volunteer
          </Link>
          <Link href="/#donate" className="px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-primary-900 font-heading font-bold text-sm rounded-xl transition-all shadow-md shadow-accent-500/20 hover:shadow-lg hover:shadow-accent-500/35 hover:-translate-y-0.5 border-2 border-primary-900/10">
            Donate Now
          </Link>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl text-primary-900 hover:bg-surface-100 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden bg-white border-t border-primary-900/10"
          >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-xl font-heading font-semibold text-sm text-primary-900 hover:bg-surface-100 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-primary-100 pt-3 mt-3 space-y-1">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-xl font-heading font-semibold text-sm text-primary-900 hover:bg-surface-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-xl font-heading font-semibold text-sm text-primary-900 hover:bg-surface-100 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/transparency"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-xl font-heading font-semibold text-sm text-primary-900 hover:bg-surface-100 transition-colors"
                >
                  Transparency
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
