"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Heart, Globe, Shield, Sparkles, Send, Award, CheckCircle2, Leaf } from "lucide-react";

import StatCard from "@/components/StatCard";
import CampaignCard from "@/components/CampaignCard";
import EventTimeline from "@/components/EventTimeline";

export default function Home() {
  // Donation widget state
  const [donateAmount, setDonateAmount] = useState<string>("1000");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedCause, setSelectedCause] = useState<string>("Environment");
  const [donorName, setDonorName] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handlePresetClick = (amount: string) => {
    setDonateAmount(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setDonateAmount("");
  };

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !donorEmail) return;

    setLoading(true);

    // Simulate Payment processing
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
      
      // Fire confetti celebration!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#0B5D3B", "#8FD694", "#F4B400", "#FFFFFF"],
      });
    }, 1500);
  };

  const finalAmount = donateAmount || customAmount || "0";

  return (
    <div className="relative overflow-x-hidden">
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-b from-surface-100/60 via-surface-100/20 to-white pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        {/* Decorative Floating SVG Leaves */}
        <div className="absolute top-1/4 left-10 w-12 h-12 text-primary-400 opacity-20 animate-bounce -z-10 hidden md:block">
          <Leaf className="w-full h-full rotate-45" />
        </div>
        <div className="absolute top-2/3 right-12 w-16 h-16 text-primary-900 opacity-10 animate-pulse -z-10 hidden md:block">
          <Leaf className="w-full h-full -rotate-12" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left text column */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-900/10 border border-primary-900/15 text-primary-900 text-xs sm:text-sm font-heading font-semibold"
              >
                <Sparkles className="w-4 h-4 text-accent-500" />
                <span>Empowering the Youth of India</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-primary-900 leading-tight"
              >
                Igniting Youth Energy For A{" "}
                <span className="handwritten-highlight inline-block font-handwritten text-accent-500 transform rotate-[-1deg] px-2 text-5xl sm:text-6xl lg:text-7xl">
                  Greener, Healthier
                </span>{" "}
                Tomorrow
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-sans text-lg text-foreground/80 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                We are a grassroots NGO ecosystem channeling youthful action into real environmental restoration, life-saving blood donation drives, and active school education campaigns.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-accent-500 hover:bg-accent-600 text-primary-900 font-heading font-extrabold rounded-2xl transition-all shadow-md shadow-accent-500/25 hover:shadow-lg hover:shadow-accent-500/40 hover:-translate-y-0.5 text-center border-2 border-primary-900/10"
                >
                  Join As Volunteer
                </Link>
                <a
                  href="#donate"
                  className="w-full sm:w-auto px-8 py-4 border-2 border-primary-900 text-primary-900 hover:bg-surface-100 font-heading font-bold rounded-2xl text-center transition-all hover:-translate-y-0.5"
                >
                  Contribute Funds
                </a>
              </motion.div>
            </div>

            {/* Right illustration column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 flex justify-center relative"
            >
              <div className="relative w-full max-w-md aspect-square organic-border bg-gradient-to-tr from-primary-900 to-primary-400 p-3 shadow-soft-lg">
                <div className="relative w-full h-full rounded-[inherit] overflow-hidden bg-white">
                  <Image
                    src="/Assets/woman hello.gif"
                    alt="Youth Welcome Animation"
                    fill
                    className="object-cover object-center"
                    unoptimized
                  />
                </div>
                {/* Floating Badge */}
                <div className="absolute -bottom-4 -left-4 bg-white border-2 border-primary-900 p-4 rounded-2xl shadow-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center text-primary-900">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-sm text-primary-900 leading-none">100% Verified</p>
                    <p className="font-sans text-xs text-foreground/75 leading-none mt-1">Social Trust Organization</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. NGO Mission Section */}
      <section id="about" className="py-24 bg-white border-y border-primary-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Media Block */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 flex justify-center order-last lg:order-first"
            >
              <div className="relative w-full max-w-sm aspect-[4/3] rounded-3xl overflow-hidden shadow-soft border-2 border-primary-200/50 bg-surface-100/50">
                <Image
                  src="/Assets/Tree_Plantation.gif"
                  alt="Tree Plantation Drive"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </motion.div>

            {/* Narrative Block */}
            <div className="lg:col-span-7 space-y-6">
              <span className="font-display font-semibold text-primary-700 uppercase tracking-widest text-sm block">Our Core Philosophy</span>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary-900 leading-tight">
                Small Collective Actions Drive Breathtaking Global Restorations
              </h2>
              <p className="font-sans text-base text-foreground/80 leading-relaxed">
                Youth Sakti Social Foundation (YSSF) was founded on a simple premise: the energy of youth is the greatest renewable resource for social good. We connect the passion of student volunteers with critical local causes that need immediate physical and financial intervention.
              </p>
              <p className="font-sans text-base text-foreground/80 leading-relaxed">
                By forming strategic partnerships with local schools and academies (like Barjora High, Delhi Public School, and St. Michael's), we create a highly coordinated network of volunteers capable of managing large-scale ecological programs, community sanitation campaigns, and healthcare support systems.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 font-heading font-bold text-primary-900 text-sm">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent-500" />
                  <span>Verified 80G Tax Exemption</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent-500" />
                  <span>Partnered with 10+ Key Schools</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent-500" />
                  <span>Real-time Fund Allocation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent-500" />
                  <span>100% Youth-Led Committees</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Live Statistics Section */}
      <section className="py-24 bg-surface-100/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="font-display font-semibold text-primary-700 uppercase tracking-widest text-sm block">Transparency & Metrics</span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary-900">
              Numbers that Tell Our Grassroots Story
            </h2>
            <p className="font-sans text-foreground/80">
              We track and verify every plant, blood unit, and rupee. True social work relies on absolute honesty and transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard
              iconName="Leaf"
              value="12,400+"
              label="Trees Planted"
              description="Acreage of local community grounds re-forested with indigenous species."
              accentColor="text-primary-900"
              delay={0.1}
            />
            <StatCard
              iconName="Heart"
              value="5,200+"
              label="Blood Units Donated"
              description="Collected across multiple camps, aiding medical centers during emergencies."
              accentColor="text-alert-500"
              delay={0.2}
            />
            <StatCard
              iconName="Globe"
              value="35+"
              label="Institutions Engaged"
              description="Collaborative campaigns hosted in local primary and high schools."
              accentColor="text-primary-700"
              delay={0.3}
            />
            <StatCard
              iconName="Shield"
              value="100%"
              label="Fund Transparency"
              description="Financial reports uploaded to the public portal for audit compliance."
              accentColor="text-accent-600"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* 4. Active Campaigns Section */}
      <section id="campaigns" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="font-display font-semibold text-primary-700 uppercase tracking-widest text-sm block">Featured Campaigns</span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary-900">
              Invest in Social Growth Initiatives
            </h2>
            <p className="font-sans text-foreground/80">
              Select one of our active campaigns. Your donation directly funds materials, transportation, and setup costs for our student actions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CampaignCard
              title="Green Canopy Project"
              category="Environment"
              description="Our target is planting 20,000 native saplings in Bankura to establish organic corridors. Funds will be used for sapling purchase, fencing, and compost."
              raised={325000}
              goal={500000}
              imageSrc="/Assets/Basic_Workflow.png"
              accentClass="text-primary-900"
              progressColor="bg-primary-900"
              delay={0.1}
            />
            <CampaignCard
              title="Sakti Blood Directory"
              category="Healthcare"
              description="Developing a custom web dashboard to match emergency donors with local hospital units in real-time, coupled with conducting 10 local weekend donation camps."
              raised={185000}
              goal={300000}
              imageSrc="/Assets/Ecosystems.png"
              accentClass="text-alert-500"
              progressColor="bg-alert-500"
              delay={0.2}
            />
            <CampaignCard
              title="Sakti Scholar Centers"
              category="Education"
              description="Setting up modern learning centers in disadvantaged communities, equipped with books, tablets, and volunteer teachers to support homework studies."
              raised={150000}
              goal={400000}
              imageSrc="/Assets/Workflows.png"
              accentClass="text-accent-600"
              progressColor="bg-accent-500"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* 5. Upcoming Events Section */}
      <section id="events" className="py-24 bg-surface-100/20 border-t border-primary-200/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="font-display font-semibold text-primary-700 uppercase tracking-widest text-sm block">Activities Schedule</span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary-900">
              Upcoming Community Mobilizations
            </h2>
            <p className="font-sans text-foreground/80">
              Join one of our school or public events. See when our teams are marching next and reserve your spot to assist.
            </p>
          </div>

          <EventTimeline />
        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="font-display font-semibold text-primary-700 uppercase tracking-widest text-sm block">Volunteer Voices</span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-primary-900">
              What Our Community Partners Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="yssf-card p-8 bg-surface-100/30 border-2 border-primary-400/25 flex flex-col justify-between"
            >
              <p className="font-sans text-foreground/90 italic leading-relaxed mb-6">
                "Our students loved the YSSF plantation drive! It wasn't just planting seeds; it was an educational seminar where kids learned about biodiversity. Highly professional team."
              </p>
              <div>
                <p className="font-heading font-bold text-primary-900 text-sm">Mr. A. Mukhopadhyay</p>
                <p className="font-display text-primary-700 text-xs">Principal, Barjora High School</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="yssf-card p-8 bg-surface-100/30 border-2 border-primary-400/25 flex flex-col justify-between"
            >
              <p className="font-sans text-foreground/90 italic leading-relaxed mb-6">
                "Volunteering with YSSF has given me a direct way to contribute to my neighborhood. The blood camp was managed flawlessly, complying with clinical standards while keeping energy high."
              </p>
              <div>
                <p className="font-heading font-bold text-primary-900 text-sm">Sneha Sen</p>
                <p className="font-display text-primary-700 text-xs">College Student & Volunteer Coordinator</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="yssf-card p-8 bg-surface-100/30 border-2 border-primary-400/25 flex flex-col justify-between"
            >
              <p className="font-sans text-foreground/90 italic leading-relaxed mb-6">
                "YSSF's commitment to reporting is outstanding. I received a detailed email report containing bills and photos showing exactly where my 80G donation went. I fully trust them."
              </p>
              <div>
                <p className="font-heading font-bold text-primary-900 text-sm">Rajeev Sharma</p>
                <p className="font-display text-primary-700 text-xs">IT Professional & Regular Donor</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. Quick Donation Widget Section */}
      <section id="donate" className="py-24 bg-gradient-to-t from-surface-100/50 to-white border-t border-primary-900/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="yssf-card bg-white p-8 md:p-12 border-2 border-primary-900/15 relative overflow-hidden"
          >
            {/* Success State Overlay */}
            <AnimatePresence>
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-primary-900 text-white flex flex-col items-center justify-center p-8 text-center z-20"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="w-20 h-20 bg-accent-500 rounded-full flex items-center justify-center text-primary-900 mb-6 border-4 border-white"
                  >
                    <CheckCircle2 className="w-12 h-12" />
                  </motion.div>
                  <h3 className="font-heading font-extrabold text-3xl mb-3">Thank You for Your Sakti!</h3>
                  <p className="font-sans text-primary-200 text-base max-w-md mb-8">
                    Your contribution of <strong className="text-accent-500 font-heading text-lg">₹{finalAmount}</strong> for the <strong className="text-white">{selectedCause}</strong> campaign has been simulated successfully. An 80G tax receipt will be sent to <span className="underline">{donorEmail}</span>.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setDonorName("");
                      setDonorEmail("");
                      setCustomAmount("");
                      setDonateAmount("1000");
                    }}
                    className="px-6 py-2.5 bg-white text-primary-900 hover:bg-surface-100 font-heading font-bold text-sm rounded-xl transition-all shadow-md"
                  >
                    Contribute Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Form Info Left */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex p-3 rounded-full bg-surface-100 text-primary-900">
                  <Heart className="w-8 h-8 text-alert-500 fill-alert-500" />
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-primary-900">Secure Donation Portal</h3>
                <p className="font-sans text-sm text-foreground/80 leading-relaxed">
                  Join our pool of impact donors. We accept digital payments (simulated here) and provide tax exemption certificates automatically.
                </p>
                <div className="space-y-3 font-sans text-xs text-foreground/75">
                  <p className="flex items-center gap-2">🛡️ Secured with SSL & Razorpay Sandbox</p>
                  <p className="flex items-center gap-2">📄 Immediate 80G Exemption Receipt</p>
                </div>
              </div>

              {/* Form Input Right */}
              <form onSubmit={handleDonateSubmit} className="lg:col-span-7 space-y-5">
                {/* Cause dropdown */}
                <div className="space-y-1.5">
                  <label htmlFor="cause-select" className="font-heading font-semibold text-xs text-primary-900">Select Cause</label>
                  <select
                    id="cause-select"
                    value={selectedCause}
                    onChange={(e) => setSelectedCause(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white font-sans text-sm text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <option value="Environment">Green Canopy (Environment)</option>
                    <option value="Blood Camp">Blood Network (Healthcare)</option>
                    <option value="Education">Scholar Centers (Education)</option>
                    <option value="General Support">General YSSF Fund</option>
                  </select>
                </div>

                {/* Pre-set amounts */}
                <div className="space-y-1.5">
                  <label className="font-heading font-semibold text-xs text-primary-900 block">Select Donation Amount (INR)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["500", "1000", "2500", "5000"].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handlePresetClick(amt)}
                        className={`py-2 rounded-xl text-xs font-heading font-bold transition-all border ${
                          donateAmount === amt
                            ? "bg-primary-900 border-primary-900 text-white shadow-sm"
                            : "bg-surface-100/50 border-primary-200 text-primary-900 hover:bg-surface-100"
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 font-sans font-semibold text-sm text-foreground/60">₹</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={handleCustomChange}
                    placeholder="Or enter custom amount in Rupees"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="donor-name-input" className="font-heading font-semibold text-xs text-primary-900">Full Name</label>
                    <input
                      id="donor-name-input"
                      type="text"
                      required
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="e.g. Joy Dev"
                      className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="donor-email-input" className="font-heading font-semibold text-xs text-primary-900">Email Address</label>
                    <input
                      id="donor-email-input"
                      type="email"
                      required
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="e.g. joy@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-accent-500 hover:bg-accent-600 disabled:bg-accent-500/50 text-primary-900 font-heading font-bold text-sm rounded-xl transition-all shadow-md shadow-accent-500/20 hover:shadow-lg flex items-center justify-center gap-2 border-2 border-primary-900/10 cursor-pointer"
                >
                  {loading ? (
                    <span>Processing Payment Sandbox...</span>
                  ) : (
                    <>
                      <span>Contribute ₹{finalAmount}</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
