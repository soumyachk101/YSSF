"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Mail, KeyRound, ArrowLeft } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const [email, setEmail] = useState(emailParam || "");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "success" | "link-sent">(token ? "link-sent" : "email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // If token is in URL, verify immediately
  useEffect(() => {
    if (token) {
      verifyLink(token);
    }
  }, [token]);

  const sendOTP = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/verify/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setStep("otp");
      } else {
        setError(data.error || "Failed to send verification code");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (!email || !otp) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/verify/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep("success");
      } else {
        setError(data.error || "Invalid verification code");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const verifyLink = async (linkToken: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/verify/verify-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: linkToken }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep("success");
      } else {
        setError(data.error || "Invalid or expired verification link");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const sendLink = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/verify/send-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setStep("link-sent");
      } else {
        setError(data.error || "Failed to send verification link");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-100/50 via-white to-surface-100/20 py-16 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-primary-900 font-heading font-semibold text-sm hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="text-center mb-10 space-y-4">
          <h1 className="font-heading font-extrabold text-4xl text-primary-900 leading-tight">
            Email Verification
          </h1>
          <p className="font-sans text-foreground/80 max-w-md mx-auto">
            Verify your email address to complete your registration.
          </p>
        </div>

        <div className="yssf-card bg-white p-8 md:p-10 border border-primary-200/40">
          {/* Success State */}
          {step === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-primary-900" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-2xl text-primary-900 mb-2">Email Verified!</h2>
                <p className="font-sans text-foreground/70">Your email has been successfully verified.</p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-primary-900 text-white px-6 py-3 rounded-xl font-heading font-bold text-sm hover:bg-primary-800 transition-colors"
              >
                Go to Login
              </Link>
            </motion.div>
          )}

          {/* Email Input */}
          {step === "email" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-primary-900" />
                </div>
                <h2 className="font-heading font-bold text-xl text-primary-900">Enter Your Email</h2>
                <p className="font-sans text-sm text-foreground/70">We&apos;ll send you a verification code</p>
              </div>

              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-primary-200 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                  onKeyDown={(e) => e.key === "Enter" && sendOTP()}
                />

                <button
                  onClick={sendOTP}
                  disabled={loading || !email}
                  className="w-full py-3 bg-primary-900 hover:bg-primary-800 disabled:bg-primary-900/50 text-white font-heading font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  <span>{loading ? "Sending..." : "Send Verification Code"}</span>
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-primary-200/40" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-foreground/50">or</span>
                  </div>
                </div>

                <button
                  onClick={sendLink}
                  disabled={loading || !email}
                  className="w-full py-3 bg-white border border-primary-200 hover:bg-surface-100 disabled:opacity-50 text-primary-900 font-heading font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Send Verification Link Instead</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* OTP Input */}
          {step === "otp" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto">
                  <KeyRound className="w-8 h-8 text-accent-600" />
                </div>
                <h2 className="font-heading font-bold text-xl text-primary-900">Enter Verification Code</h2>
                <p className="font-sans text-sm text-foreground/70">
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-4 rounded-xl border border-primary-200 font-mono text-2xl text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-accent-500"
                  onKeyDown={(e) => e.key === "Enter" && verifyOTP()}
                />

                <button
                  onClick={verifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 bg-primary-900 hover:bg-primary-800 disabled:bg-primary-900/50 text-white font-heading font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{loading ? "Verifying..." : "Verify Code"}</span>
                </button>

                <button
                  onClick={() => { setStep("email"); setOtp(""); setError(null); }}
                  className="w-full text-sm text-primary-900/70 hover:text-primary-900 font-heading font-semibold cursor-pointer"
                >
                  Use a different email
                </button>
              </div>
            </motion.div>
          )}

          {/* Link Sent */}
          {step === "link-sent" && !token && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-primary-900" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-xl text-primary-900 mb-2">Check Your Email</h2>
                <p className="font-sans text-sm text-foreground/70">
                  We sent a verification link to <strong>{email}</strong>. Click the link in the email to verify your account.
                </p>
              </div>
              <button
                onClick={() => { setStep("email"); setError(null); setMessage(null); }}
                className="text-sm text-primary-900/70 hover:text-primary-900 font-heading font-semibold cursor-pointer"
              >
                Use a different email
              </button>
            </motion.div>
          )}

          {/* Error/Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-sans">
              {error}
            </div>
          )}
          {message && !error && (
            <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-xl text-sm text-primary-700 font-sans">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-900" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
