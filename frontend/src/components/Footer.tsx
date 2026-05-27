"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname.startsWith("/auth");

  if (isAuthPage) return null;

  return (
    <footer className="bg-primary-900 text-white border-t-4 border-accent-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary-900 font-display text-xl font-bold border-2 border-accent-500">
                YS
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-white text-lg leading-none tracking-tight">YOUTH SAKTI</span>
                <span className="font-display font-medium text-accent-500 text-sm tracking-wide">Social Foundation</span>
              </div>
            </div>
            <p className="font-sans text-sm text-primary-200 leading-relaxed">
              A youth-led NGO movement empowering grassroots social action, reforestation, blood camps, and child education transparency.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-accent-500 hover:text-primary-900 flex items-center justify-center cursor-pointer transition-colors text-sm">𝕏</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-accent-500 hover:text-primary-900 flex items-center justify-center cursor-pointer transition-colors text-sm">fb</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-accent-500 hover:text-primary-900 flex items-center justify-center cursor-pointer transition-colors text-sm">in</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-accent-500 hover:text-primary-900 flex items-center justify-center cursor-pointer transition-colors text-sm">ig</a>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold text-accent-500 mb-6 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3 font-sans text-sm text-primary-200">
              <li><Link href="/" className="hover:text-white transition-colors">Home Page</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/campaigns" className="hover:text-white transition-colors">Impact Campaigns</Link></li>
              <li><Link href="/events" className="hover:text-white transition-colors">Upcoming Events</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog & Reports</Link></li>
              <li><Link href="/gallery" className="hover:text-white transition-colors">Photo Gallery</Link></li>
              <li><Link href="/calendar" className="hover:text-white transition-colors">Event Calendar</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/transparency" className="hover:text-white transition-colors">Transparency</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Volunteer Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-accent-500 mb-6 text-sm uppercase tracking-wider">Registration & Tax</h4>
            <ul className="space-y-3 font-sans text-sm text-primary-200">
              <li>NGO Reg No: YSSF/2024/WB098</li>
              <li>Tax Status: 80G Tax Exempt Eligible</li>
              <li>PAN Card: AACY09827B</li>
              <li>FCRA Status: Under Application</li>
              <li>
                <a
                  href="/ngo_registration_forms.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline decoration-dotted transition-colors"
                >
                  Download Registration Form (PDF)
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-accent-500 mb-6 text-sm uppercase tracking-wider">Get In Touch</h4>
            <ul className="space-y-3 font-sans text-sm text-primary-200">
              <li>Email: <a href="mailto:info@youthsakti.org" className="hover:text-white transition-colors">info@youthsakti.org</a></li>
              <li>Phone: +91 98765 43210</li>
              <li>Address: Block 4, Sector V, Salt Lake, Kolkata, West Bengal, 700091</li>
              <li className="pt-2 font-display text-base text-accent-500 italic">&quot;Small actions together create lasting impact.&quot;</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-200/70 font-sans">
          <p>© {new Date().getFullYear()} Youth Sakti Social Foundation. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/donation-policy" className="hover:text-white transition-colors">Donation Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
