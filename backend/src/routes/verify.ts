import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { generateOTP, generateVerificationToken, sendOTPEmail, sendVerificationLinkEmail } from "../lib/email.js";

export const verifyRoutes = Router();

const sendOTPSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const verifyOTPSchema = z.object({
  email: z.string().email("Invalid email format"),
  code: z.string().length(6, "OTP must be 6 digits"),
});

const verifyLinkSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// POST /api/verify/send-otp - Send OTP to email
verifyRoutes.post("/send-otp", async (req, res) => {
  try {
    const parseResult = sendOTPSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues[0].message });
      return;
    }

    const { email } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      res.json({ success: true, message: "If an account exists with this email, a verification code has been sent." });
      return;
    }

    if (user.emailVerified) {
      res.json({ success: true, message: "Email is already verified." });
      return;
    }

    // Invalidate any existing OTPs
    await prisma.verification.updateMany({
      where: { userId: user.id, type: "email_otp", used: false },
      data: { used: true },
    });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.verification.create({
      data: {
        userId: user.id,
        code: otp,
        type: "email_otp",
        expiresAt,
      },
    });

    const sent = await sendOTPEmail(email, user.name, otp);

    if (!sent) {
      res.status(500).json({ error: "Failed to send verification code" });
      return;
    }

    res.json({ success: true, message: "If an account exists with this email, a verification code has been sent." });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send verification code" });
  }
});

// POST /api/verify/verify-otp - Verify OTP
verifyRoutes.post("/verify-otp", async (req, res) => {
  try {
    const parseResult = verifyOTPSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues[0].message });
      return;
    }

    const { email, code } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ error: "Invalid verification code" });
      return;
    }

    const verification = await prisma.verification.findFirst({
      where: {
        userId: user.id,
        code,
        type: "email_otp",
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      res.status(400).json({ error: "Invalid or expired verification code" });
      return;
    }

    // Mark verification as used and user as verified
    await prisma.verification.update({
      where: { id: verification.id },
      data: { used: true },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Failed to verify code" });
  }
});

// POST /api/verify/send-link - Send verification link
verifyRoutes.post("/send-link", async (req, res) => {
  try {
    const parseResult = sendOTPSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues[0].message });
      return;
    }

    const { email } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.json({ success: true, message: "If an account exists with this email, a verification link has been sent." });
      return;
    }

    if (user.emailVerified) {
      res.json({ success: true, message: "Email is already verified." });
      return;
    }

    // Invalidate any existing links
    await prisma.verification.updateMany({
      where: { userId: user.id, type: "email_link", used: false },
      data: { used: true },
    });

    const token = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verification.create({
      data: {
        userId: user.id,
        code: token,
        type: "email_link",
        expiresAt,
      },
    });

    const sent = await sendVerificationLinkEmail(email, user.name, token);

    if (!sent) {
      res.status(500).json({ error: "Failed to send verification link" });
      return;
    }

    res.json({ success: true, message: "If an account exists with this email, a verification link has been sent." });
  } catch (error) {
    console.error("Error sending verification link:", error);
    res.status(500).json({ error: "Failed to send verification link" });
  }
});

// POST /api/verify/verify-link - Verify via link token
verifyRoutes.post("/verify-link", async (req, res) => {
  try {
    const parseResult = verifyLinkSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues[0].message });
      return;
    }

    const { token } = parseResult.data;

    const verification = await prisma.verification.findFirst({
      where: {
        code: token,
        type: "email_link",
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      res.status(400).json({ error: "Invalid or expired verification link" });
      return;
    }

    // Mark verification as used and user as verified
    await prisma.verification.update({
      where: { id: verification.id },
      data: { used: true },
    });

    await prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true },
    });

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying link:", error);
    res.status(500).json({ error: "Failed to verify email" });
  }
});

// GET /api/verify/status/:email - Check verification status
verifyRoutes.get("/status/:email", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.params.email },
      select: { emailVerified: true },
    });

    if (!user) {
      res.json({ verified: false });
      return;
    }

    res.json({ verified: user.emailVerified });
  } catch (error) {
    console.error("Error checking verification status:", error);
    res.status(500).json({ error: "Failed to check status" });
  }
});
