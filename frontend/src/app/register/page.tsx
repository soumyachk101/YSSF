"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Users,
  Heart,
  Building,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  Mail,
} from "lucide-react";
import { apiSignUp } from "@/lib/api";

type RoleType = "volunteer" | "donor" | "ngo";

function parseRoleParam(role: string | null): RoleType {
  return role === "donor" || role === "ngo" ? role : "volunteer";
}

function RegisterFormContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<RoleType>(() => parseRoleParam(searchParams.get("role")));
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form Fields - Volunteer
  const [vName, setVName] = useState("");
  const [vEmail, setVEmail] = useState("");
  const [vPhone, setVPhone] = useState("");
  const [vDob, setVDob] = useState("");
  const [vAvailability, setVAvailability] = useState("Weekends");
  const [vSkills, setVSkills] = useState<string[]>([]);
  const [vLocation, setVLocation] = useState("");
  const [vEmergencyName, setVEmergencyName] = useState("");
  const [vEmergencyPhone, setVEmergencyPhone] = useState("");
  const [vPassword, setVPassword] = useState("");
  const [vConfirmPassword, setVConfirmPassword] = useState("");

  // Form Fields - Donor
  const [dName, setDName] = useState("");
  const [dEmail, setDEmail] = useState("");
  const [dPhone, setDPhone] = useState("");
  const [dAddress, setDAddress] = useState("");
  const [dPan, setDPan] = useState("");
  const [dCauses, setDCauses] = useState<string[]>([]);
  const [dPassword, setDPassword] = useState("");
  const [dConfirmPassword, setDConfirmPassword] = useState("");

  // Form Fields - NGO Partner
  const [nOrgName, setNOrgName] = useState("");
  const [nRegNumber, setNRegNumber] = useState("");
  const [nContactPerson, setNContactPerson] = useState("");
  const [nEmail, setNEmail] = useState("");
  const [nWebsite, setNWebsite] = useState("");
  const [nAddress, setNAddress] = useState("");
  const [nMission, setNMission] = useState("");
  const [nBankDetails, setNBankDetails] = useState("");
  const [nFileUploaded, setNFileUploaded] = useState<boolean>(false);
  const [nPassword, setNPassword] = useState("");
  const [nConfirmPassword, setNConfirmPassword] = useState("");

  // Checkboxes
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);

  const toggleSkill = (skill: string) => {
    setVSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const toggleCause = (cause: string) => {
    setDCauses(prev => 
      prev.includes(cause) ? prev.filter(c => c !== cause) : [...prev, cause]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!agreeTerms) {
      setError("Please agree to the Terms and Conditions / Privacy Policy.");
      return;
    }

    // Get role-specific values
    let name = "", email = "", phone = "", password = "", confirmPassword = "";
    const roleMap: Record<RoleType, string> = {
      volunteer: "volunteer",
      donor: "donor",
      ngo: "ngo_partner",
    };

    if (activeTab === "volunteer") {
      name = vName; email = vEmail; phone = vPhone; password = vPassword; confirmPassword = vConfirmPassword;
    } else if (activeTab === "donor") {
      name = dName; email = dEmail; phone = dPhone || ""; password = dPassword; confirmPassword = dConfirmPassword;
    } else if (activeTab === "ngo") {
      name = nContactPerson; email = nEmail; phone = ""; password = nPassword; confirmPassword = nConfirmPassword;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await apiSignUp({
        name,
        email,
        phone,
        role: roleMap[activeTab],
        password,
      });

      if (result?.success) {
        setIsSuccess(true);
        setEmailSent(true);
        confetti({
          particleCount: 180,
          spread: 100,
          origin: { y: 0.5 },
          colors: ["#0B5D3B", "#8FD694", "#F4B400", "#FFFFFF"],
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setEmailSent(false);
    setAgreeTerms(false);
    setError(null);
    setFieldErrors({});
    // Reset inputs
    setVName(""); setVEmail(""); setVPhone(""); setVDob(""); setVLocation(""); setVPassword(""); setVConfirmPassword("");
    setDName(""); setDEmail(""); setDPhone(""); setDAddress(""); setDPan(""); setDPassword(""); setDConfirmPassword("");
    setNOrgName(""); setNRegNumber(""); setNContactPerson(""); setNEmail(""); setNWebsite(""); setNPassword(""); setNConfirmPassword("");
    setAName(""); setAEmail(""); setAEmployeeId(""); setAPassword(""); setAConfirmPassword("");
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Back Link */}
      <Link href="/" className="inline-flex items-center gap-2 text-primary-900 font-heading font-semibold text-sm hover:underline mb-8">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Landing Page</span>
      </Link>

      {/* Header Title */}
      <div className="text-center mb-12 space-y-4">
        <h1 className="font-heading font-extrabold text-4xl text-primary-900 leading-tight">
          Connect with <span className="handwritten-highlight inline-block font-handwritten text-accent-500 transform rotate-[-0.5deg]">Youth Sakti</span>
        </h1>
        <p className="font-sans text-foreground/80 max-w-xl mx-auto">
          Choose your role and register to join our ecosystem. Empower local communities, restore forests, or secure financial operations.
        </p>
      </div>

      {/* Tab Headers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 bg-surface-100/70 p-2 rounded-2xl border border-primary-200/30">
        <button
          onClick={() => { setActiveTab("volunteer"); setIsSuccess(false); }}
          className={`py-3 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all ${
            activeTab === "volunteer"
              ? "bg-primary-900 border-primary-900 text-white shadow-md cursor-pointer"
              : "bg-transparent border-transparent text-primary-900/80 hover:bg-white/50 cursor-pointer"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Volunteer</span>
        </button>
        
        <button
          onClick={() => { setActiveTab("donor"); setIsSuccess(false); }}
          className={`py-3 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all ${
            activeTab === "donor"
              ? "bg-accent-500 border-accent-500 text-primary-900 shadow-md cursor-pointer"
              : "bg-transparent border-transparent text-primary-900/80 hover:bg-white/50 cursor-pointer"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Donor</span>
        </button>

        <button
          onClick={() => { setActiveTab("ngo"); setIsSuccess(false); }}
          className={`py-3 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all ${
            activeTab === "ngo"
              ? "bg-primary-700 border-primary-700 text-white shadow-md cursor-pointer"
              : "bg-transparent border-transparent text-primary-900/80 hover:bg-white/50 cursor-pointer"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>NGO Partner</span>
        </button>

      </div>

      {/* Tab Contents */}
      <div className="yssf-card bg-white p-8 md:p-12 border border-primary-200/40 relative overflow-hidden min-h-[500px]">
        
        {/* Success Panel Overlay */}
        <AnimatePresence>
          {isSuccess && (
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
              
              <h3 className="font-heading font-extrabold text-3xl mb-3">
                {emailSent ? "Check Your Email!" : "Registration Successful!"}
              </h3>

              {emailSent ? (
                <div className="space-y-3 mb-8">
                  <div className="inline-flex p-3 rounded-full bg-white/10 text-accent-500 mb-2">
                    <Mail className="w-8 h-8" />
                  </div>
                  <p className="font-sans text-primary-200 text-base max-w-md">
                    We have sent a verification link to your email address. Please check your inbox and verify your email to activate your account.
                  </p>
                  <p className="font-sans text-primary-200/70 text-sm">
                    You can sign in after verifying your email.
                  </p>
                </div>
              ) : (
                <p className="font-sans text-primary-200 text-base max-w-md mb-8">
                  {activeTab === "volunteer" && `Welcome to the team! We have registered you as a volunteer. You will receive updates about upcoming drives.`}
                  {activeTab === "donor" && `Thank you for registering! You are now part of our donor ecosystem. We will coordinate details regarding tax certificates.`}
                  {activeTab === "ngo" && `Thank you! Your NGO registration request has been submitted. Our compliance team will audit the license number and contact you.`}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {emailSent && (
                  <Link
                    href="/login"
                    className="px-6 py-2.5 bg-accent-500 text-primary-900 hover:bg-accent-400 font-heading font-bold text-sm rounded-xl transition-all shadow-md text-center"
                  >
                    Go to Login
                  </Link>
                )}
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-white text-primary-900 hover:bg-surface-100 font-heading font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Register Another Account
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="font-sans text-sm text-red-700">{error}</p>
            </motion.div>
          )}
          
          {/* VOLUNTEER TAB */}
          {activeTab === "volunteer" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-primary-100">
                <div className="p-2 rounded-xl bg-surface-100 text-primary-900">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-primary-900">Volunteer Registration</h3>
                  <p className="font-sans text-xs text-foreground/75 mt-0.5">Availability, skills, and emergency safety coordinates.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label htmlFor="vol-name" className="font-heading font-semibold text-xs text-primary-900">Full Name</label>
                  <input
                    id="vol-name"
                    type="text"
                    required
                    value={vName}
                    onChange={(e) => setVName(e.target.value)}
                    placeholder="e.g. Rahul Shaw"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vol-dob" className="font-heading font-semibold text-xs text-primary-900">Date of Birth</label>
                  <input
                    id="vol-dob"
                    type="date"
                    required
                    value={vDob}
                    onChange={(e) => setVDob(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vol-email" className="font-heading font-semibold text-xs text-primary-900">Email Address</label>
                  <input
                    id="vol-email"
                    type="email"
                    required
                    value={vEmail}
                    onChange={(e) => setVEmail(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vol-phone" className="font-heading font-semibold text-xs text-primary-900">Phone Number</label>
                  <input
                    id="vol-phone"
                    type="tel"
                    required
                    value={vPhone}
                    onChange={(e) => setVPhone(e.target.value)}
                    placeholder="e.g. +91 98300 12345"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vol-location" className="font-heading font-semibold text-xs text-primary-900">Location (City / Area)</label>
                  <input
                    id="vol-location"
                    type="text"
                    required
                    value={vLocation}
                    onChange={(e) => setVLocation(e.target.value)}
                    placeholder="e.g. Salt Lake, Kolkata"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vol-availability" className="font-heading font-semibold text-xs text-primary-900">Availability</label>
                  <select
                    id="vol-availability"
                    value={vAvailability}
                    onChange={(e) => setVAvailability(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-primary-900"
                  >
                    <option value="Weekends">Weekends Only</option>
                    <option value="Weekdays">Weekdays Only</option>
                    <option value="Flexible">Flexible hours</option>
                    <option value="On-Call Emergency">Emergency Response On-Call</option>
                  </select>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label htmlFor="vol-password" className="font-heading font-semibold text-xs text-primary-900">Password</label>
                  <input
                    id="vol-password"
                    type="password"
                    required
                    value={vPassword}
                    onChange={(e) => setVPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className={`w-full px-4 py-3 rounded-xl border font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground ${
                      fieldErrors.password ? "border-red-400" : "border-primary-200"
                    }`}
                  />
                  {fieldErrors.password && (
                    <p className="font-sans text-xs text-red-500 mt-1">{fieldErrors.password[0]}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="vol-confirm-password" className="font-heading font-semibold text-xs text-primary-900">Confirm Password</label>
                  <input
                    id="vol-confirm-password"
                    type="password"
                    required
                    value={vConfirmPassword}
                    onChange={(e) => setVConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                  />
                </div>
              </div>

              {/* Skills Checkboxes */}
              <div className="space-y-2">
                <label className="font-heading font-semibold text-xs text-primary-900 block">Skills / Areas of Interest</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["Teaching", "Event Planning", "Social Media", "Manual Labor", "First Aid", "Reforestation", "Photography", "Tech Support"].map((skill) => {
                    const isSelected = vSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-2 rounded-xl text-xs font-heading font-semibold border transition-all text-center cursor-pointer ${
                          isSelected
                            ? "bg-primary-900 border-primary-900 text-white shadow-sm"
                            : "bg-surface-100/30 border-primary-200 text-primary-900 hover:bg-surface-100"
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 bg-surface-100/30 rounded-2xl border border-primary-200/20 space-y-4">
                <h4 className="font-heading font-bold text-xs text-primary-900 flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-warning-500" /> Emergency Contact Info</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="vol-emergency-name" className="font-heading font-medium text-xs text-primary-900/80">Contact Person Name</label>
                    <input
                      id="vol-emergency-name"
                      type="text"
                      required
                      value={vEmergencyName}
                      onChange={(e) => setVEmergencyName(e.target.value)}
                      placeholder="e.g. Sunita Shaw (Mother)"
                      className="w-full px-4 py-2.5 rounded-xl border border-primary-200 bg-white font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="vol-emergency-phone" className="font-heading font-medium text-xs text-primary-900/80">Emergency Phone</label>
                    <input
                      id="vol-emergency-phone"
                      type="tel"
                      required
                      value={vEmergencyPhone}
                      onChange={(e) => setVEmergencyPhone(e.target.value)}
                      placeholder="e.g. +91 98300 98765"
                      className="w-full px-4 py-2.5 rounded-xl border border-primary-200 bg-white font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DONOR TAB */}
          {activeTab === "donor" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-primary-100">
                <div className="p-2 rounded-xl bg-accent-500/10 text-accent-600">
                  <Heart className="w-6 h-6 fill-accent-600" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-primary-900">Donor Account Registration</h3>
                  <p className="font-sans text-xs text-foreground/75 mt-0.5">Short form profile registration for Tax exemption certificate tracking.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label htmlFor="donor-name" className="font-heading font-semibold text-xs text-primary-900">Full Name / Org Name</label>
                  <input
                    id="donor-name"
                    type="text"
                    required
                    value={dName}
                    onChange={(e) => setDName(e.target.value)}
                    placeholder="e.g. Amitava Mitra"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="donor-pan" className="font-heading font-semibold text-xs text-primary-900">Tax ID / PAN Number (For 80G Tax Exemption)</label>
                  <input
                    id="donor-pan"
                    type="text"
                    required
                    value={dPan}
                    onChange={(e) => setDPan(e.target.value)}
                    placeholder="e.g. ABCDE1234F"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 uppercase text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="donor-email" className="font-heading font-semibold text-xs text-primary-900">Email Address (For Tax Receipts)</label>
                  <input
                    id="donor-email"
                    type="email"
                    required
                    value={dEmail}
                    onChange={(e) => setDEmail(e.target.value)}
                    placeholder="e.g. amitava@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="donor-phone" className="font-heading font-semibold text-xs text-primary-900">Phone Number (Optional)</label>
                  <input
                    id="donor-phone"
                    type="tel"
                    value={dPhone}
                    onChange={(e) => setDPhone(e.target.value)}
                    placeholder="e.g. +91 94330 98765"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label htmlFor="donor-address" className="font-heading font-semibold text-xs text-primary-900">Mailing Address (For physical thank-you kits)</label>
                  <textarea
                    id="donor-address"
                    required
                    rows={3}
                    value={dAddress}
                    onChange={(e) => setDAddress(e.target.value)}
                    placeholder="e.g. Flat 3A, Green Meadows Appt, Salt Lake, Kolkata, 700091"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none text-foreground"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label htmlFor="donor-password" className="font-heading font-semibold text-xs text-primary-900">Password</label>
                  <input
                    id="donor-password"
                    type="password"
                    required
                    value={dPassword}
                    onChange={(e) => setDPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className={`w-full px-4 py-3 rounded-xl border font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground ${
                      fieldErrors.password ? "border-red-400" : "border-primary-200"
                    }`}
                  />
                  {fieldErrors.password && (
                    <p className="font-sans text-xs text-red-500 mt-1">{fieldErrors.password[0]}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="donor-confirm-password" className="font-heading font-semibold text-xs text-primary-900">Confirm Password</label>
                  <input
                    id="donor-confirm-password"
                    type="password"
                    required
                    value={dConfirmPassword}
                    onChange={(e) => setDConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                  />
                </div>
              </div>

              {/* Causes selection */}
              <div className="space-y-2">
                <label className="font-heading font-semibold text-xs text-primary-900 block">Preferred Social Causes</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["Education", "Healthcare", "Environment Restoration", "Clean Water & Sanitation", "Disaster Relief", "Youth Empowerment"].map((cause) => {
                    const isSelected = dCauses.includes(cause);
                    return (
                      <button
                        key={cause}
                        type="button"
                        onClick={() => toggleCause(cause)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-heading font-semibold border transition-all text-center cursor-pointer ${
                          isSelected
                            ? "bg-accent-500 border-accent-500 text-primary-900 shadow-sm"
                            : "bg-surface-100/30 border-primary-200 text-primary-900 hover:bg-surface-100"
                        }`}
                      >
                        {cause}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* NGO PARTNER TAB */}
          {activeTab === "ngo" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-primary-100">
                <div className="p-2 rounded-xl bg-primary-700/10 text-primary-700">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-primary-900">NGO Partner Registration</h3>
                  <p className="font-sans text-xs text-foreground/75 mt-0.5">B2B onboarding form. Credentials must undergo regulatory audit before validation.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label htmlFor="ngo-org-name" className="font-heading font-semibold text-xs text-primary-900">Organization Legal Name</label>
                  <input
                    id="ngo-org-name"
                    type="text"
                    required
                    value={nOrgName}
                    onChange={(e) => setNOrgName(e.target.value)}
                    placeholder="e.g. Green Earth Foundation"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="ngo-reg-num" className="font-heading font-semibold text-xs text-primary-900">NGO Registration Number / Darpan License ID</label>
                  <input
                    id="ngo-reg-num"
                    type="text"
                    required
                    value={nRegNumber}
                    onChange={(e) => setNRegNumber(e.target.value)}
                    placeholder="e.g. DARPAN/WB/2024/09876"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="ngo-contact" className="font-heading font-semibold text-xs text-primary-900">Official Contact Person (Name & Title)</label>
                  <input
                    id="ngo-contact"
                    type="text"
                    required
                    value={nContactPerson}
                    onChange={(e) => setNContactPerson(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Kumar (Director)"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="ngo-email" className="font-heading font-semibold text-xs text-primary-900">Official Organization Email</label>
                  <input
                    id="ngo-email"
                    type="email"
                    required
                    value={nEmail}
                    onChange={(e) => setNEmail(e.target.value)}
                    placeholder="e.g. admin@greenearth.org"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="ngo-web" className="font-heading font-semibold text-xs text-primary-900">Website URL</label>
                  <input
                    id="ngo-web"
                    type="url"
                    required
                    value={nWebsite}
                    onChange={(e) => setNWebsite(e.target.value)}
                    placeholder="e.g. https://greenearth.org"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="ngo-bank" className="font-heading font-semibold text-xs text-primary-900">Disbursement Bank Account Details (IFSC, A/C No)</label>
                  <input
                    id="ngo-bank"
                    type="text"
                    required
                    value={nBankDetails}
                    onChange={(e) => setNBankDetails(e.target.value)}
                    placeholder="e.g. SBI, A/C: 98765432101, IFSC: SBIN000123"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label htmlFor="ngo-address" className="font-heading font-semibold text-xs text-primary-900">Headquarters Address</label>
                  <input
                    id="ngo-address"
                    type="text"
                    required
                    value={nAddress}
                    onChange={(e) => setNAddress(e.target.value)}
                    placeholder="e.g. 12, Park Street, Kolkata, West Bengal, 700016"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label htmlFor="ngo-mission" className="font-heading font-semibold text-xs text-primary-900">Mission Statement (Short bio of activities)</label>
                  <textarea
                    id="ngo-mission"
                    required
                    rows={3}
                    value={nMission}
                    onChange={(e) => setNMission(e.target.value)}
                    placeholder="Briefly state your NGO's objectives, regular campaigns, and geographic areas of focus."
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none text-foreground"
                  />
                </div>
              </div>

              {/* File Upload Mockup */}
              <div className="space-y-2">
                <label className="font-heading font-semibold text-xs text-primary-900 block">Verification Documents (Legal 12A / 80G Certificates)</label>
                <div className="border-2 border-dashed border-primary-200 hover:border-primary-400 rounded-2xl p-6 flex flex-col items-center justify-center transition-colors bg-surface-100/10">
                  <FileText className="w-8 h-8 text-primary-900/60 mb-2" />
                  {nFileUploaded ? (
                    <span className="font-heading font-bold text-xs text-primary-900 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-primary-900" /> document_verification_pack.pdf (Uploaded)
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setNFileUploaded(true)}
                      className="px-4 py-2 bg-primary-900 text-white font-heading font-semibold text-xs rounded-xl hover:bg-primary-800 transition-colors shadow-sm cursor-pointer"
                    >
                      Upload Regulatory PDF Pack
                    </button>
                  )}
                  <span className="font-sans text-[10px] text-foreground/60 mt-1">Accepts PDF, ZIP formats under 10MB</span>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label htmlFor="ngo-password" className="font-heading font-semibold text-xs text-primary-900">Password</label>
                  <input
                    id="ngo-password"
                    type="password"
                    required
                    value={nPassword}
                    onChange={(e) => setNPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className={`w-full px-4 py-3 rounded-xl border font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground ${
                      fieldErrors.password ? "border-red-400" : "border-primary-200"
                    }`}
                  />
                  {fieldErrors.password && (
                    <p className="font-sans text-xs text-red-500 mt-1">{fieldErrors.password[0]}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="ngo-confirm-password" className="font-heading font-semibold text-xs text-primary-900">Confirm Password</label>
                  <input
                    id="ngo-confirm-password"
                    type="password"
                    required
                    value={nConfirmPassword}
                    onChange={(e) => setNConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Privacy Checkbox */}
          <div className="border-t border-primary-100 pt-6 flex items-start gap-3">
            <input
              id="agree-checkbox"
              type="checkbox"
              required
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 h-4.5 w-4.5 rounded border-primary-200 text-primary-900 focus:ring-accent-500 cursor-pointer"
            />
            <label htmlFor="agree-checkbox" className="font-sans text-xs text-foreground/75 leading-relaxed cursor-pointer select-none">
              I verify that the credentials provided are accurate and agree to the YSSF <a href="#" className="underline font-semibold hover:text-primary-900">Privacy Policy</a> and <a href="#" className="underline font-semibold hover:text-primary-900">Terms & Conditions</a> regarding data collection and regulatory communication.
            </label>
          </div>

          {/* Form Actions */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 text-white font-heading font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "volunteer" ? "bg-primary-900 hover:bg-primary-800 shadow-primary-900/10 hover:shadow-primary-900/20" : ""
            } ${
              activeTab === "donor" ? "bg-accent-600 hover:bg-accent-700 shadow-accent-600/10 hover:shadow-accent-600/20" : ""
            } ${
              activeTab === "ngo" ? "bg-primary-700 hover:bg-primary-600 shadow-primary-700/10 hover:shadow-primary-700/20" : ""
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Profile...</span>
              </>
            ) : (
              "Submit Registration Application"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-surface-100/50 via-white to-surface-100/20">
        <div className="text-center font-heading font-bold text-primary-900 animate-pulse">Loading registration forms...</div>
      </div>
    }>
      <RegisterFormContent />
    </Suspense>
  );
}
