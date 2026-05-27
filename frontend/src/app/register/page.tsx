"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Users,
  Heart,
  Building,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Globe,
  Loader2,
  Mail,
  KeyRound,
  Phone,
  User,
  Calendar,
  MapPin,
  Check,
  UploadCloud,
} from "lucide-react";
import { apiSignUpFull, apiVerifyEmail, apiResendVerification } from "@/lib/api";
import { signInWithGoogle } from "@/lib/supabase";

type RoleType = "volunteer" | "donor" | "ngo";

function parseRoleParam(role: string | null): RoleType {
  return role === "donor" || role === "ngo" ? role : "volunteer";
}

function RegisterFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Wizard Steps: 1 = Basic/Account Setup, 2 = Onboarding details, 3 = OTP verification
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [activeTab, setActiveTab] = useState<RoleType>(() => parseRoleParam(searchParams.get("role")));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Form Fields - Basic Account Info (Step 1)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);

  // Password Validation States
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

  // Form Fields - Volunteer Onboarding (Step 2)
  const [vDob, setVDob] = useState("");
  const [vLocation, setVLocation] = useState("");
  const [vAvailability, setVAvailability] = useState("Weekends");
  const [vSkills, setVSkills] = useState<string[]>([]);
  const [vEmergencyName, setVEmergencyName] = useState("");
  const [vEmergencyPhone, setVEmergencyPhone] = useState("");

  // Form Fields - Donor Onboarding (Step 2)
  const [dPan, setDPan] = useState("");
  const [dAddress, setDAddress] = useState("");
  const [dCauses, setDCauses] = useState<string[]>([]);

  // Form Fields - NGO Onboarding (Step 2)
  const [nOrgName, setNOrgName] = useState("");
  const [nRegNumber, setNRegNumber] = useState("");
  const [nWebsite, setNWebsite] = useState("");
  const [nAddress, setNAddress] = useState("");
  const [nMission, setNMission] = useState("");
  const [nBankDetails, setNBankDetails] = useState("");
  const [nFileUploaded, setNFileUploaded] = useState<boolean>(false);

  // OTP Verification States (Step 3)
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer logic for resending OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 3 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

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

  const validateStep1 = () => {
    setError(null);
    if (!name.trim()) {
      setError("Please enter your name.");
      return false;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!isPasswordValid) {
      setError("Password does not meet complexity requirements.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (!agreeTerms) {
      setError("You must agree to the Terms and Conditions.");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const roleMap: Record<RoleType, string> = {
      volunteer: "volunteer",
      donor: "donor",
      ngo: "ngo_partner",
    };

    // Prepare complete data payload based on role
    let payload: Record<string, unknown> = {
      name,
      email,
      phone: phone || null,
      role: roleMap[activeTab],
      password,
    };

    if (activeTab === "volunteer") {
      payload = {
        ...payload,
        dob: vDob || null,
        location: vLocation || null,
        skills: vSkills.length > 0 ? vSkills.join(", ") : null,
        availability: vAvailability,
        emergencyName: vEmergencyName || null,
        emergencyPhone: vEmergencyPhone || null,
      };
    } else if (activeTab === "donor") {
      payload = {
        ...payload,
        panTaxId: dPan || null,
        address: dAddress || null,
        preferredCauses: dCauses.length > 0 ? dCauses.join(", ") : null,
      };
    } else if (activeTab === "ngo") {
      payload = {
        ...payload,
        orgName: nOrgName || null,
        regNumber: nRegNumber || null,
        website: nWebsite || null,
        address: nAddress || null,
        mission: nMission || null,
        bankDetails: nBankDetails || null,
      };
    }

    try {
      const result = await apiSignUpFull(payload);
      if (result?.success) {
        // Automatically transition to OTP input screen
        setStep(3);
        setTimer(60);
        setCanResend(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification Handling
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        otpRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").substring(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return;

    setOtpLoading(true);
    setOtpError(null);

    try {
      const result = await apiVerifyEmail(email, code);
      if (result.success) {
        setIsSuccess(true);
        confetti({
          particleCount: 180,
          spread: 100,
          origin: { y: 0.5 },
          colors: ["#0B5D3B", "#8FD694", "#F4B400", "#FFFFFF"],
        });
        setTimeout(() => {
          const dashboardRouteMap: Record<string, string> = {
            admin: "/dashboard/admin",
            volunteer: "/dashboard/volunteer",
            donor: "/dashboard/donor",
            ngo_partner: "/dashboard/volunteer",
          };
          router.push(dashboardRouteMap[result.user.role.toLowerCase()] || "/dashboard");
        }, 1800);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid verification code.";
      setOtpError(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setOtpError(null);
    try {
      await apiResendVerification(email);
      setTimer(60);
      setCanResend(false);
      setOtp(Array(6).fill(""));
      otpRefs.current[0]?.focus();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend code";
      setOtpError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#05291a] via-[#0B5D3B] to-[#DFF7E2] flex items-center justify-center p-4 md:py-16 relative overflow-hidden selection:bg-accent-500 selection:text-primary-900">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-400/20 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-500/10 blur-[130px] pointer-events-none animate-pulse duration-700" />

      <div className="w-full max-w-[580px] z-10">
        {/* Navigation & Header */}
        <div className="flex justify-between items-center mb-6 px-1">
          <Link
            href="/"
            className="flex items-center gap-2 group text-white/80 hover:text-white text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <div className="w-5.5 h-5.5 bg-accent-500 rounded-full flex items-center justify-center text-primary-900 font-display text-[10px] font-bold">
              YS
            </div>
            <span className="font-heading font-extrabold text-[10px] text-white tracking-widest uppercase">YSSF Portal</span>
          </div>
        </div>

        {/* Wizard Progress Stepper */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step >= 1 ? "bg-accent-500 text-primary-900" : "bg-white/20 text-white/60"
            }`}>
              {step > 1 ? <Check className="w-4 h-4" /> : "1"}
            </div>
            <span className={`text-xs font-bold tracking-wide transition-colors ${
              step >= 1 ? "text-white" : "text-white/40"
            }`}>Account</span>
          </div>
          <div className={`flex-grow h-0.5 mx-2 bg-white/20 relative overflow-hidden`}>
            <div className="absolute inset-y-0 left-0 bg-accent-500 transition-all duration-300" style={{ width: step > 1 ? "100%" : "0%" }} />
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step >= 2 ? "bg-accent-500 text-primary-900" : "bg-white/20 text-white/60"
            }`}>
              {step > 2 ? <Check className="w-4 h-4" /> : "2"}
            </div>
            <span className={`text-xs font-bold tracking-wide transition-colors ${
              step >= 2 ? "text-white" : "text-white/40"
            }`}>Profile Setup</span>
          </div>
          <div className={`flex-grow h-0.5 mx-2 bg-white/20 relative overflow-hidden`}>
            <div className="absolute inset-y-0 left-0 bg-accent-500 transition-all duration-300" style={{ width: step > 2 ? "100%" : "0%" }} />
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step === 3 ? "bg-accent-500 text-primary-900" : "bg-white/20 text-white/60"
            }`}>
              3
            </div>
            <span className={`text-xs font-bold tracking-wide transition-colors ${
              step === 3 ? "text-white" : "text-white/40"
            }`}>Verification</span>
          </div>
        </div>

        {/* Form Card Container */}
        <div className="bg-white/95 backdrop-blur-xl border border-primary-200/30 rounded-[32px] shadow-2xl p-8 md:p-10 relative overflow-hidden min-h-[460px] flex flex-col">
          {/* Card Accent Top Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-900 via-accent-500 to-primary-700" />

          {/* Success Panel Overlay */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-primary-900 text-white flex flex-col items-center justify-center p-8 text-center z-30"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="w-20 h-20 bg-accent-500 rounded-full flex items-center justify-center text-primary-900 mb-6 border-4 border-white shadow-lg"
                >
                  <CheckCircle2 className="w-12 h-12" />
                </motion.div>
                
                <h3 className="font-heading font-extrabold text-3xl mb-2 tracking-tight">Account Active!</h3>
                <p className="font-sans text-primary-200 text-base max-w-xs mb-8">
                  Your email has been verified and your profile is loaded. Redirecting to dashboard...
                </p>
                <div className="flex items-center gap-2 text-accent-500 text-sm font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading dashboard...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          {error && step !== 3 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="font-sans text-xs text-red-700 leading-relaxed font-semibold">{error}</p>
            </motion.div>
          )}

          {/* Steps Content switcher */}
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Account setup */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 flex-grow flex flex-col"
              >
                {/* Header */}
                <div>
                  <h1 className="font-heading font-black text-3xl text-primary-900 leading-none tracking-tight mb-2">
                    Create Account
                  </h1>
                  <p className="font-sans text-sm text-primary-900/60 font-medium">
                    First, set up your credentials and select your role
                  </p>
                </div>

                {/* Google Sign-Up */}
                <button
                  onClick={() => signInWithGoogle()}
                  className="w-full py-3.5 bg-white border border-primary-200 hover:border-primary-400 hover:bg-surface-100/10 text-primary-900 font-heading font-bold text-sm rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3 cursor-pointer group"
                >
                  <Globe className="w-4.5 h-4.5 text-primary-850 group-hover:scale-105 transition-transform" />
                  <span>Sign up with Google</span>
                </button>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-primary-200/50" />
                  <span className="font-heading font-bold text-[10px] text-primary-900/40 uppercase tracking-widest">Or register with email</span>
                  <div className="flex-1 h-px bg-primary-200/50" />
                </div>

                {/* Role Cards Selector */}
                <div className="space-y-2">
                  <label className="font-heading font-bold text-[11px] text-primary-900/80 uppercase tracking-wider block">
                    Choose Your Role
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Volunteer */}
                    <button
                      type="button"
                      onClick={() => setActiveTab("volunteer")}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden ${
                        activeTab === "volunteer"
                          ? "border-primary-900 bg-primary-900/5 text-primary-900 shadow-md ring-2 ring-primary-900/20"
                          : "border-primary-200 bg-transparent text-primary-900/65 hover:border-primary-400"
                      }`}
                    >
                      <Users className="w-5 h-5" />
                      <span className="font-heading font-bold text-xs">Volunteer</span>
                    </button>

                    {/* Donor */}
                    <button
                      type="button"
                      onClick={() => setActiveTab("donor")}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden ${
                        activeTab === "donor"
                          ? "border-accent-600 bg-accent-500/10 text-accent-700 shadow-md ring-2 ring-accent-500/20"
                          : "border-primary-200 bg-transparent text-primary-900/65 hover:border-primary-400"
                      }`}
                    >
                      <Heart className="w-5 h-5" />
                      <span className="font-heading font-bold text-xs">Donor</span>
                    </button>

                    {/* NGO Partner */}
                    <button
                      type="button"
                      onClick={() => setActiveTab("ngo")}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden ${
                        activeTab === "ngo"
                          ? "border-primary-750 bg-primary-700/5 text-primary-750 shadow-md ring-2 ring-primary-700/20"
                          : "border-primary-200 bg-transparent text-primary-900/65 hover:border-primary-400"
                      }`}
                    >
                      <Building className="w-5 h-5" />
                      <span className="font-heading font-bold text-xs">NGO Partner</span>
                    </button>
                  </div>
                </div>

                {/* Step 1 Inputs */}
                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg-name" className="font-heading font-bold text-[11px] text-primary-900/80 uppercase tracking-wider block">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-900/40">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Rahul Shaw"
                        className="w-full pl-10 pr-4 py-2.5 bg-surface-100/20 focus:bg-white rounded-2xl border border-primary-200 focus:border-accent-500 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-foreground transition-all"
                      />
                    </div>
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="reg-email" className="font-heading font-bold text-[11px] text-primary-900/80 uppercase tracking-wider block">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-900/40">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id="reg-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="rahul@example.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-surface-100/20 focus:bg-white rounded-2xl border border-primary-200 focus:border-accent-500 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-foreground transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="reg-phone" className="font-heading font-bold text-[11px] text-primary-900/80 uppercase tracking-wider block">
                        Phone (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-900/40">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          id="reg-phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98300 12345"
                          className="w-full pl-10 pr-4 py-2.5 bg-surface-100/20 focus:bg-white rounded-2xl border border-primary-200 focus:border-accent-500 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-foreground transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password & Confirm Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="reg-pass" className="font-heading font-bold text-[11px] text-primary-900/80 uppercase tracking-wider block">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-900/40">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <input
                          id="reg-pass"
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 8 chars"
                          className="w-full pl-10 pr-4 py-2.5 bg-surface-100/20 focus:bg-white rounded-2xl border border-primary-200 focus:border-accent-500 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-foreground transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="reg-conf-pass" className="font-heading font-bold text-[11px] text-primary-900/80 uppercase tracking-wider block">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-900/40">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <input
                          id="reg-conf-pass"
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full pl-10 pr-4 py-2.5 bg-surface-100/20 focus:bg-white rounded-2xl border border-primary-200 focus:border-accent-500 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-foreground transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Complexity Checklist indicator */}
                  {password && (
                    <div className="p-3 bg-surface-100/30 rounded-2xl border border-primary-200/30 grid grid-cols-3 gap-2">
                      <div className="flex items-center gap-1">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${
                          hasMinLength ? "bg-primary-900 text-white" : "bg-primary-200 text-primary-900"
                        }`}>
                          {hasMinLength ? <Check className="w-2 h-2" /> : "•"}
                        </div>
                        <span className="text-[10px] font-sans font-bold text-primary-900/70">8+ Characters</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${
                          hasUppercase ? "bg-primary-900 text-white" : "bg-primary-200 text-primary-900"
                        }`}>
                          {hasUppercase ? <Check className="w-2 h-2" /> : "•"}
                        </div>
                        <span className="text-[10px] font-sans font-bold text-primary-900/70">1 Uppercase</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${
                          hasNumber ? "bg-primary-900 text-white" : "bg-primary-200 text-primary-900"
                        }`}>
                          {hasNumber ? <Check className="w-2 h-2" /> : "•"}
                        </div>
                        <span className="text-[10px] font-sans font-bold text-primary-900/70">1 Digit</span>
                      </div>
                    </div>
                  )}

                  {/* Agree Checkbox */}
                  <div className="flex items-start gap-2.5 pt-2">
                    <input
                      id="terms-agree"
                      type="checkbox"
                      required
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-primary-200 text-primary-900 focus:ring-accent-500 cursor-pointer"
                    />
                    <label htmlFor="terms-agree" className="font-sans text-[11px] text-primary-900/60 leading-relaxed font-semibold cursor-pointer select-none">
                      I verify that my credentials are correct and agree to the YSSF <Link href="/privacy" className="underline font-bold text-primary-900">Privacy Policy</Link> and <Link href="/terms" className="underline font-bold text-primary-900">Terms</Link>.
                    </label>
                  </div>
                </div>

                {/* Step 1 Actions */}
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!name || !email || !password || !confirmPassword || !agreeTerms || !isPasswordValid}
                  className="w-full mt-auto py-3.5 bg-primary-900 hover:bg-primary-800 disabled:bg-primary-900/50 text-white font-heading font-bold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed group"
                >
                  <span>Continue to Profile Setup</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <p className="text-center font-sans text-xs text-primary-900/60 font-semibold mt-2">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary-900 hover:text-primary-800 underline font-bold">
                    Sign In instead
                  </Link>
                </p>
              </motion.div>
            )}

            {/* STEP 2: Supplementary profile details */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5 flex-grow flex flex-col"
              >
                {/* Header */}
                <div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs text-primary-900/60 hover:text-primary-900 font-bold mb-3 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to credentials</span>
                  </button>

                  <h1 className="font-heading font-black text-2xl text-primary-900 leading-none tracking-tight mb-1.5">
                    Profile Onboarding
                  </h1>
                  <p className="font-sans text-xs text-primary-900/60 font-medium">
                    Help us know you better. These fields are optional but recommended.
                  </p>
                </div>

                <form onSubmit={handleSubmitOnboarding} className="space-y-4 flex-grow flex flex-col">
                  {/* VOLUNTEER ONBOARDING */}
                  {activeTab === "volunteer" && (
                    <div className="space-y-4">
                      {/* Grid: Dob & Location */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor="v-dob" className="font-heading font-bold text-[10px] text-primary-900/70 uppercase tracking-wider">Date of Birth</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary-900/40">
                              <Calendar className="w-3.5 h-3.5" />
                            </div>
                            <input
                              id="v-dob"
                              type="date"
                              value={vDob}
                              onChange={(e) => setVDob(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-surface-100/10 focus:bg-white rounded-xl border border-primary-200 focus:border-accent-500 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-foreground"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="v-loc" className="font-heading font-bold text-[10px] text-primary-900/70 uppercase tracking-wider">Location (City)</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary-900/40">
                              <MapPin className="w-3.5 h-3.5" />
                            </div>
                            <input
                              id="v-loc"
                              type="text"
                              value={vLocation}
                              onChange={(e) => setVLocation(e.target.value)}
                              placeholder="Kolkata, WB"
                              className="w-full pl-9 pr-3 py-2 bg-surface-100/10 focus:bg-white rounded-xl border border-primary-200 focus:border-accent-500 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-foreground"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Availability Selection */}
                      <div className="space-y-1.5">
                        <label htmlFor="v-avail" className="font-heading font-bold text-[10px] text-primary-900/70 uppercase tracking-wider">Availability</label>
                        <select
                          id="v-avail"
                          value={vAvailability}
                          onChange={(e) => setVAvailability(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-primary-200 focus:border-accent-500 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-foreground"
                        >
                          <option value="Weekends">Weekends Only</option>
                          <option value="Weekdays">Weekdays Only</option>
                          <option value="Flexible">Flexible hours</option>
                          <option value="On-Call Emergency">Emergency Response On-Call</option>
                        </select>
                      </div>

                      {/* Skills Interactive Badges */}
                      <div className="space-y-1.5">
                        <label className="font-heading font-bold text-[10px] text-primary-900/70 uppercase tracking-wider block">Skills / Areas of Interest</label>
                        <div className="flex flex-wrap gap-1.5">
                          {["Teaching", "Event Planning", "Social Media", "Manual Labor", "First Aid", "Reforestation", "Photography", "Tech Support"].map((skill) => {
                            const isSelected = vSkills.includes(skill);
                            return (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => toggleSkill(skill)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-heading font-bold border transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-primary-900 border-primary-900 text-white shadow-sm"
                                    : "bg-surface-100/15 border-primary-200 text-primary-900/80 hover:bg-surface-100"
                                }`}
                              >
                                {skill}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Emergency Contact */}
                      <div className="p-3 bg-surface-100/20 rounded-2xl border border-primary-200/20 space-y-2">
                        <span className="font-heading font-extrabold text-[10px] text-primary-900 uppercase tracking-widest block">Emergency Safety Coordinate</span>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={vEmergencyName}
                            onChange={(e) => setVEmergencyName(e.target.value)}
                            placeholder="Contact Person (e.g. Mother)"
                            className="px-3 py-2 bg-white rounded-xl border border-primary-200 focus:border-accent-500 font-sans text-[11px] focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-foreground"
                          />
                          <input
                            type="tel"
                            value={vEmergencyPhone}
                            onChange={(e) => setVEmergencyPhone(e.target.value)}
                            placeholder="Emergency Phone Number"
                            className="px-3 py-2 bg-white rounded-xl border border-primary-200 focus:border-accent-500 font-sans text-[11px] focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-foreground"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DONOR ONBOARDING */}
                  {activeTab === "donor" && (
                    <div className="space-y-4">
                      {/* PAN Card Input */}
                      <div className="space-y-1">
                        <label htmlFor="d-pan" className="font-heading font-bold text-[10px] text-primary-900/70 uppercase tracking-wider block">Tax ID / PAN Number (For 80G Receipts)</label>
                        <input
                          id="d-pan"
                          type="text"
                          value={dPan}
                          onChange={(e) => setDPan(e.target.value.toUpperCase())}
                          placeholder="ABCDE1234F"
                          className="w-full px-3 py-2 bg-surface-100/10 focus:bg-white rounded-xl border border-primary-200 focus:border-accent-500 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent-500/20 uppercase text-foreground"
                        />
                      </div>

                      {/* Mailing Address */}
                      <div className="space-y-1">
                        <label htmlFor="d-addr" className="font-heading font-bold text-[10px] text-primary-900/70 uppercase tracking-wider block">Mailing Address (For physical thank-you kits)</label>
                        <textarea
                          id="d-addr"
                          rows={2}
                          value={dAddress}
                          onChange={(e) => setDAddress(e.target.value)}
                          placeholder="Flat 3A, Green Meadows Appt, Salt Lake, Kolkata, 700091"
                          className="w-full px-3 py-2 bg-surface-100/10 focus:bg-white rounded-xl border border-primary-200 focus:border-accent-500 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent-500/20 resize-none text-foreground"
                        />
                      </div>

                      {/* Cause Interactive Badges */}
                      <div className="space-y-1.5">
                        <label className="font-heading font-bold text-[10px] text-primary-900/70 uppercase tracking-wider block">Preferred Causes</label>
                        <div className="flex flex-wrap gap-1.5">
                          {["Education", "Healthcare", "Environment Restoration", "Clean Water & Sanitation", "Disaster Relief", "Youth Empowerment"].map((cause) => {
                            const isSelected = dCauses.includes(cause);
                            return (
                              <button
                                key={cause}
                                type="button"
                                onClick={() => toggleCause(cause)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-heading font-bold border transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-accent-500 border-accent-500 text-primary-900 shadow-sm"
                                    : "bg-surface-100/15 border-primary-200 text-primary-900/80 hover:bg-surface-100"
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

                  {/* NGO ONBOARDING */}
                  {activeTab === "ngo" && (
                    <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                      {/* Grid: Legal Name & Darpan ID */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label htmlFor="n-legal" className="font-heading font-bold text-[9px] text-primary-900/70 uppercase tracking-wider">Organization Legal Name</label>
                          <input
                            id="n-legal"
                            type="text"
                            required
                            value={nOrgName}
                            onChange={(e) => setNOrgName(e.target.value)}
                            placeholder="Green Earth Foundation"
                            className="w-full px-3 py-1.5 bg-surface-100/10 focus:bg-white rounded-xl border border-primary-200 focus:border-accent-500 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-foreground"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="n-darpan" className="font-heading font-bold text-[9px] text-primary-900/70 uppercase tracking-wider">Darpan License ID</label>
                          <input
                            id="n-darpan"
                            type="text"
                            required
                            value={nRegNumber}
                            onChange={(e) => setNRegNumber(e.target.value)}
                            placeholder="DARPAN/WB/2024/09876"
                            className="w-full px-3 py-1.5 bg-surface-100/10 focus:bg-white rounded-xl border border-primary-200 focus:border-accent-500 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-foreground"
                          />
                        </div>
                      </div>

                      {/* Grid: Website & Bank Details */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label htmlFor="n-web" className="font-heading font-bold text-[9px] text-primary-900/70 uppercase tracking-wider">Website URL</label>
                          <input
                            id="n-web"
                            type="url"
                            value={nWebsite}
                            onChange={(e) => setNWebsite(e.target.value)}
                            placeholder="https://greenearth.org"
                            className="w-full px-3 py-1.5 bg-surface-100/10 focus:bg-white rounded-xl border border-primary-200 focus:border-accent-500 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-foreground"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="n-bank" className="font-heading font-bold text-[9px] text-primary-900/70 uppercase tracking-wider">Bank Details (IFSC, A/C)</label>
                          <input
                            id="n-bank"
                            type="text"
                            value={nBankDetails}
                            onChange={(e) => setNBankDetails(e.target.value)}
                            placeholder="SBI, A/C: 987654321..."
                            className="w-full px-3 py-1.5 bg-surface-100/10 focus:bg-white rounded-xl border border-primary-200 focus:border-accent-500 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-foreground"
                          />
                        </div>
                      </div>

                      {/* HQ Address */}
                      <div className="space-y-1">
                        <label htmlFor="n-hq" className="font-heading font-bold text-[9px] text-primary-900/70 uppercase tracking-wider">Headquarters Address</label>
                        <input
                          id="n-hq"
                          type="text"
                          value={nAddress}
                          onChange={(e) => setNAddress(e.target.value)}
                          placeholder="12, Park Street, Kolkata, WB"
                          className="w-full px-3 py-1.5 bg-surface-100/10 focus:bg-white rounded-xl border border-primary-200 focus:border-accent-500 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-foreground"
                        />
                      </div>

                      {/* Mission Statement */}
                      <div className="space-y-1">
                        <label htmlFor="n-mission" className="font-heading font-bold text-[9px] text-primary-900/70 uppercase tracking-wider">Mission Statement</label>
                        <textarea
                          id="n-mission"
                          rows={2}
                          value={nMission}
                          onChange={(e) => setNMission(e.target.value)}
                          placeholder="Objectives and geographic focus of activities..."
                          className="w-full px-3 py-1.5 bg-surface-100/10 focus:bg-white rounded-xl border border-primary-200 focus:border-accent-500 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent-500/20 resize-none text-foreground"
                        />
                      </div>

                      {/* Upload Regulatory Documents (Mockup) */}
                      <div className="space-y-1.5">
                        <label className="font-heading font-bold text-[9px] text-primary-900/70 uppercase tracking-wider block">Verification Documents (12A / 80G Certificates)</label>
                        <button
                          type="button"
                          onClick={() => setNFileUploaded(!nFileUploaded)}
                          className="w-full border border-dashed border-primary-200 hover:border-primary-400 bg-surface-100/10 rounded-xl p-3 flex flex-col items-center justify-center transition-colors cursor-pointer text-center"
                        >
                          <UploadCloud className="w-5 h-5 text-primary-900/50 mb-1" />
                          {nFileUploaded ? (
                            <span className="text-[10px] font-heading font-bold text-primary-900 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary-900 fill-white" /> compliance_pack.pdf (Uploaded)
                            </span>
                          ) : (
                            <>
                              <span className="text-[10px] font-heading font-bold text-primary-900">Upload Regulatory PDF Pack</span>
                              <span className="text-[8px] text-primary-900/50">Accepts PDF, ZIP under 10MB</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2 Actions */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full mt-auto py-3.5 text-white font-heading font-bold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed ${
                      activeTab === "volunteer" ? "bg-primary-900 hover:bg-primary-800 shadow-primary-900/10" : ""
                    } ${
                      activeTab === "donor" ? "bg-accent-600 hover:bg-accent-700 shadow-accent-600/10" : ""
                    } ${
                      activeTab === "ngo" ? "bg-primary-700 hover:bg-primary-600 shadow-primary-700/10" : ""
                    }`}
                  >
                    {loading ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      "Complete Onboarding & Verify"
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 3: OTP Verification */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 flex-grow flex flex-col justify-center"
              >
                {/* Header */}
                <div>
                  <h1 className="font-heading font-black text-2xl text-primary-900 leading-none tracking-tight mb-2">
                    Verify Your Email
                  </h1>
                  <p className="font-sans text-xs text-primary-900/60 font-semibold leading-relaxed">
                    We have sent a 6-digit verification code to <span className="text-primary-900 font-bold">{email}</span>. Please enter it to activate your account.
                  </p>
                </div>

                {/* OTP Error Display */}
                {otpError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="font-sans text-xs text-red-700 leading-relaxed font-semibold">{otpError}</p>
                  </motion.div>
                )}

                {/* OTP Form */}
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* Inputs Grid */}
                  <div className="flex justify-between gap-2.5">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        required
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        className="w-12 h-14 text-center bg-surface-100/30 border border-primary-200 focus:border-accent-500 rounded-xl text-lg font-heading font-black focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-foreground transition-all shadow-sm"
                      />
                    ))}
                  </div>

                  {/* Verify Action Button */}
                  <button
                    type="submit"
                    disabled={otp.some((d) => !d) || otpLoading}
                    className="w-full py-3.5 bg-primary-900 hover:bg-primary-800 disabled:bg-primary-900/50 text-white font-heading font-bold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {otpLoading ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      "Verify & Activate Profile"
                    )}
                  </button>
                </form>

                {/* Resend Options */}
                <div className="text-center">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-heading font-extrabold text-xs text-accent-600 hover:text-accent-700 underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <p className="font-sans text-xs text-primary-900/50 font-semibold">
                      Resend code in <span className="font-bold text-primary-900">{timer}s</span>
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-tr from-[#05291a] via-[#0B5D3B] to-[#DFF7E2] flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-white/70 mx-auto" />
            <p className="font-heading font-bold text-white animate-pulse">Loading registration portal...</p>
          </div>
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}
