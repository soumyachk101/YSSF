import type { Metadata } from "next";
import { Nunito, Poppins, Gochi_Hand, Patrick_Hand } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const gochiHand = Gochi_Hand({
  subsets: ["latin"],
  variable: "--font-gochi-hand",
  weight: ["400"],
});

const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  variable: "--font-patrick-hand",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Youth Sakti Social Foundation | Youth Energy for Social Impact",
  description: "YSSF is a youth-driven ecosystem connecting volunteers, donors, and communities for environmental restoration, health drives, education campaigns, and social transparency.",
};

export default function RootLayout({
  children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${poppins.variable} ${gochiHand.variable} ${patrickHand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-foreground selection:bg-primary-200 selection:text-primary-900">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-primary-900/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-primary-900 rounded-full flex items-center justify-center text-accent-500 font-display text-xl font-bold border-2 border-primary-400 group-hover:scale-105 transition-transform duration-300">
                YS
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-primary-900 text-lg leading-none tracking-tight">YOUTH SAKTI</span>
                <span className="font-display font-medium text-primary-900/70 text-sm tracking-wide">Social Foundation</span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="font-heading font-medium text-primary-900/85 hover:text-primary-900 hover:underline underline-offset-4 decoration-accent-500 decoration-2 transition-colors">
                Home
              </Link>
              <a href="/#about" className="font-heading font-medium text-primary-900/85 hover:text-primary-900 hover:underline underline-offset-4 decoration-accent-500 decoration-2 transition-colors">
                Our Mission
              </a>
              <a href="/#campaigns" className="font-heading font-medium text-primary-900/85 hover:text-primary-900 hover:underline underline-offset-4 decoration-accent-500 decoration-2 transition-colors">
                Campaigns
              </a>
              <a href="/#events" className="font-heading font-medium text-primary-900/85 hover:text-primary-900 hover:underline underline-offset-4 decoration-accent-500 decoration-2 transition-colors">
                Upcoming Events
              </a>
            </nav>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              <Link href="/register" className="hidden sm:inline-flex px-5 py-2.5 bg-primary-900 hover:bg-primary-800 text-white font-heading font-semibold text-sm rounded-xl transition-all shadow-md shadow-primary-900/10 hover:shadow-lg hover:shadow-primary-900/20 hover:-translate-y-0.5">
                Join As Volunteer
              </Link>
              <a href="/#donate" className="px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-primary-900 font-heading font-bold text-sm rounded-xl transition-all shadow-md shadow-accent-500/20 hover:shadow-lg hover:shadow-accent-500/35 hover:-translate-y-0.5 border-2 border-primary-900/10">
                Donate Now
              </a>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
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
                  <span className="w-8 h-8 rounded-full bg-white/10 hover:bg-accent-500 hover:text-primary-900 flex items-center justify-center cursor-pointer transition-colors text-sm">𝕏</span>
                  <span className="w-8 h-8 rounded-full bg-white/10 hover:bg-accent-500 hover:text-primary-900 flex items-center justify-center cursor-pointer transition-colors text-sm">fb</span>
                  <span className="w-8 h-8 rounded-full bg-white/10 hover:bg-accent-500 hover:text-primary-900 flex items-center justify-center cursor-pointer transition-colors text-sm">in</span>
                  <span className="w-8 h-8 rounded-full bg-white/10 hover:bg-accent-500 hover:text-primary-900 flex items-center justify-center cursor-pointer transition-colors text-sm">ig</span>
                </div>
              </div>

              <div>
                <h4 className="font-heading font-bold text-accent-500 mb-6 text-sm uppercase tracking-wider">Quick Links</h4>
                <ul className="space-y-3 font-sans text-sm text-primary-200">
                  <li><Link href="/" className="hover:text-white transition-colors">Home Page</Link></li>
                  <li><a href="/#about" className="hover:text-white transition-colors">Our Mission</a></li>
                  <li><a href="/#campaigns" className="hover:text-white transition-colors">Impact Campaigns</a></li>
                  <li><a href="/#events" className="hover:text-white transition-colors">Upcoming Events</a></li>
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
                  <li>Trust registration details verified</li>
                </ul>
              </div>

              <div>
                <h4 className="font-heading font-bold text-accent-500 mb-6 text-sm uppercase tracking-wider">Get In Touch</h4>
                <ul className="space-y-3 font-sans text-sm text-primary-200">
                  <li>Email: <a href="mailto:info@youthsakti.org" className="hover:text-white transition-colors">info@youthsakti.org</a></li>
                  <li>Phone: +91 98765 43210</li>
                  <li>Address: Block 4, Sector V, Salt Lake, Kolkata, West Bengal, 700091</li>
                  <li className="pt-2 font-display text-base text-accent-500 italic">"Small actions together create lasting impact."</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-200/70 font-sans">
              <p>© {new Date().getFullYear()} Youth Sakti Social Foundation. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Donation Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
