"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Globe,
  Mail,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronRight,
  ShieldCheck,
  User,
} from "lucide-react";
import { apiSignIn, apiVerifyEmail, apiResendVerification } from "@/lib/api";
import { signInWithGoogle } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP Verification Flow States
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Dev mode helper state
  const [showDevHelper, setShowDevHelper] = useState(false);

  // Timer logic for resending OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtpScreen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, showOtpScreen]);

  const getDashboardPath = (role: string): string => {
    const roleMap: Record<string, string> = {
      admin: "/dashboard/admin",
      volunteer: "/dashboard/volunteer",
      donor: "/dashboard/donor",
      ngo_partner: "/dashboard/volunteer",
    };
    return roleMap[role.toLowerCase()] || "/dashboard";
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    try {
      const result = await apiSignIn(email, password);
      if (result?.success) {
        if (result.emailVerified === false) {
          // Send verification OTP to email and trigger OTP screen
          await apiResendVerification(email).catch(console.error);
          setShowOtpScreen(true);
          setTimer(60);
          setCanResend(false);
        } else {
          // Success verified login
          triggerSuccessAnimation(result.user.role);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid email or password";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const triggerSuccessAnimation = (role: string) => {
    setIsSuccess(true);
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#0B5D3B", "#8FD694", "#F4B400", "#FFFFFF"],
    });
    setTimeout(() => {
      router.push(getDashboardPath(role));
    }, 1500);
  };

  // OTP Handling Functions
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
        triggerSuccessAnimation(result.user.role);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed. Please check your code.";
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

  // Dev Quick Logins
  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setShowDevHelper(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#05291a] via-[#0B5D3B] to-[#DFF7E2] flex items-center justify-center p-4 relative overflow-hidden selection:bg-accent-500 selection:text-primary-900">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-400/20 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-500/10 blur-[130px] pointer-events-none animate-pulse duration-700" />

      <div className="w-full max-w-[460px] z-10">
        {/* Logo and Back Home link */}
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

        {/* Auth Card */}
        <div className="bg-white/95 backdrop-blur-xl border border-primary-200/30 rounded-[32px] shadow-2xl p-8 md:p-10 relative overflow-hidden">
          {/* Card Accent Top Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-900 via-accent-500 to-primary-700" />

          {/* Success Overlay */}
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
                  className="w-20 h-20 bg-accent-500 rounded-full flex items-center justify-center text-primary-900 mb-6 border-4 border-white shadow-lg shadow-accent-500/30"
                >
                  <CheckCircle2 className="w-12 h-12" />
                </motion.div>
                <h3 className="font-heading font-extrabold text-3xl mb-2 tracking-tight">Welcome Back!</h3>
                <p className="font-sans text-primary-200 text-base max-w-xs mb-8">
                  Sign in authorized successfully. Preparing your dashboard...
                </p>
                <div className="flex items-center gap-2 text-accent-500 text-sm font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Redirecting...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Auth Screen */}
          <AnimatePresence mode="wait">
            {!showOtpScreen ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Header */}
                <div>
                  <h1 className="font-heading font-black text-3xl text-primary-900 leading-none tracking-tight mb-2">
                    Sign In
                  </h1>
                  <p className="font-sans text-sm text-primary-900/60 font-medium">
                    Access your account dashboard to track impact
                  </p>
                </div>

                {/* General Error Display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="font-sans text-xs text-red-700 leading-relaxed font-semibold">{error}</p>
                  </motion.div>
                )}

                {/* Google Sign-In */}
                <button
                  type="button"
                  onClick={() => signInWithGoogle()}
                  className="w-full py-3.5 bg-white border border-primary-200 hover:border-primary-400 hover:bg-surface-100/10 text-primary-900 font-heading font-bold text-sm rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3 cursor-pointer group"
                >
                  <Globe className="w-4.5 h-4.5 text-primary-800 group-hover:scale-105 transition-transform" />
                  <span>Continue with Google</span>
                </button>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-primary-200/50" />
                  <span className="font-heading font-bold text-[10px] text-primary-900/40 uppercase tracking-widest">Or email sign in</span>
                  <div className="flex-1 h-px bg-primary-200/50" />
                </div>

                {/* Login Form */}
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="login-email" className="font-heading font-bold text-[11px] text-primary-900/80 uppercase tracking-wider block">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-900/40">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="login-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@yssf.org"
                        className="w-full pl-10 pr-4 py-3 bg-surface-100/20 focus:bg-white rounded-2xl border border-primary-200 focus:border-accent-500 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-foreground transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="login-password" className="font-heading font-bold text-[11px] text-primary-900/80 uppercase tracking-wider block">
                        Password
                      </label>
                      <a href="#" className="font-heading font-bold text-[10px] text-accent-600 hover:text-accent-700 hover:underline">
                        Forgot?
                      </a>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-900/40">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-surface-100/20 focus:bg-white rounded-2xl border border-primary-200 focus:border-accent-500 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-foreground transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-primary-900/40 hover:text-primary-900/70 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={!email || !password || loading}
                    className="w-full mt-2 py-3.5 bg-primary-900 hover:bg-primary-800 disabled:bg-primary-900/50 text-white font-heading font-bold text-sm rounded-2xl transition-all shadow-md shadow-primary-900/10 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Switch Link */}
                <p className="text-center font-sans text-xs text-primary-900/60 font-semibold pt-2">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-primary-900 hover:text-primary-800 underline font-bold">
                    Create free account
                  </Link>
                </p>

                {/* Dev Mode Helper Expandable */}
                <div className="border-t border-primary-100/70 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowDevHelper(!showDevHelper)}
                    className="w-full flex items-center justify-between text-left text-[10px] uppercase tracking-widest font-heading font-extrabold text-primary-900/40 hover:text-primary-900/70 transition-colors py-1 cursor-pointer"
                  >
                    <span>Developer quick accounts</span>
                    <span>{showDevHelper ? "Hide" : "Show"}</span>
                  </button>
                  <AnimatePresence>
                    {showDevHelper && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-2 pt-2.5"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuickLogin("admin@yssf.org", "admin123")}
                            className="p-2 bg-accent-500/10 hover:bg-accent-500/20 text-accent-700 text-left font-heading text-xs font-bold rounded-xl border border-accent-500/20 cursor-pointer flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <div className="flex flex-col leading-none">
                              <span>Admin User</span>
                              <span className="text-[8px] opacity-75">Click to fill</span>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickLogin("volunteer@yssf.org", "volunteer123")}
                            className="p-2 bg-primary-900/5 hover:bg-primary-900/10 text-primary-900 text-left font-heading text-xs font-bold rounded-xl border border-primary-900/10 cursor-pointer flex items-center gap-1.5"
                          >
                            <User className="w-3.5 h-3.5" />
                            <div className="flex flex-col leading-none">
                              <span>Volunteer</span>
                              <span className="text-[8px] opacity-75">Click to fill</span>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Header */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpScreen(false);
                      setOtp(Array(6).fill(""));
                      setOtpError(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-primary-900/60 hover:text-primary-900 font-bold mb-4 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to password</span>
                  </button>

                  <h1 className="font-heading font-black text-2xl text-primary-900 leading-none tracking-tight mb-2">
                    Verify Your Email
                  </h1>
                  <p className="font-sans text-xs text-primary-900/60 font-semibold leading-relaxed">
                    We have sent a 6-digit verification code to <span className="text-primary-900 font-bold">{email}</span>. Please enter it below.
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

                {/* OTP Input Form */}
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
                      "Verify & Sign In"
                    )}
                  </button>
                </form>

                {/* Resend and timer options */}
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
