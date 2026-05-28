import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { getUserFromRequest } from "../lib/auth.js";
import { sendOTPEmail, sendVerificationLinkEmail } from "../lib/email.js";


export const verifyRoutes = Router();

function generateSecureOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

const verifyOTPSchema = z.object({
  email: z.string().email("Invalid email format"),
  code: z.string().length(6, "OTP must be 6 digits"),
});

const sendOTPSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const verifyLinkSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// POST /api/verify/send-otp
verifyRoutes.post("/send-otp", async (req, res) => {
  try {
    const parseResult = sendOTPSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const { email } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      res.json({ success: true, message: "If an account exists, OTP has been sent" });
      return;
    }

    if (user.emailVerified) {
      res.json({ success: true, message: "Email is already verified" });
      return;
    }

    // Invalidate existing OTPs
    await prisma.verification.updateMany({
      where: { userId: user.id, type: "email_otp", used: false },
      data: { used: true },
    });

    const otp = generateSecureOTP();
    await prisma.verification.create({
      data: {
        userId: user.id,
        code: otp,
        type: "email_otp",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Send OTP email
    sendOTPEmail(email, otp).catch((err) =>
      console.error("Error sending OTP email:", err)
    );


    res.json({ success: true, message: "If an account exists, OTP has been sent" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// POST /api/verify/verify-otp
verifyRoutes.post("/verify-otp", async (req, res) => {
  try {
    const parseResult = verifyOTPSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const { email, code } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ error: "Invalid or expired OTP" });
      return;
    }

    if (user.emailVerified) {
      res.json({ success: true, message: "Email already verified" });
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
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      res.status(400).json({ error: "Invalid or expired OTP" });
      return;
    }

    await prisma.$transaction([
      prisma.verification.update({
        where: { id: verification.id },
        data: { used: true },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      }),
    ]);

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// POST /api/verify/send-link
verifyRoutes.post("/send-link", async (req, res) => {
  try {
    const parseResult = sendOTPSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const { email } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.json({ success: true, message: "If an account exists, a verification link has been sent" });
      return;
    }

    if (user.emailVerified) {
      res.json({ success: true, message: "Email is already verified" });
      return;
    }

    // Invalidate existing links
    await prisma.verification.updateMany({
      where: { userId: user.id, type: "email_link", used: false },
      data: { used: true },
    });

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.verification.create({
      data: {
        userId: user.id,
        code: token,
        type: "email_link",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify?token=${token}`;
    // Send verification link email
    sendVerificationLinkEmail(email, verifyUrl).catch((err) =>
      console.error("Error sending verification link email:", err)
    );


    res.json({ success: true, message: "If an account exists, a verification link has been sent" });
  } catch (error) {
    console.error("Error sending verification link:", error);
    res.status(500).json({ error: "Failed to send verification link" });
  }
});

// POST /api/verify/verify-link
verifyRoutes.post("/verify-link", async (req, res) => {
  try {
    const parseResult = verifyLinkSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Invalid input" });
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

    await prisma.$transaction([
      prisma.verification.update({
        where: { id: verification.id },
        data: { used: true },
      }),
      prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: true },
      }),
    ]);

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying link:", error);
    res.status(500).json({ error: "Failed to verify link" });
  }
});

// GET /api/verify/status
verifyRoutes.get("/status", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    res.json({ emailVerified: user.emailVerified });
  } catch (error) {
    console.error("Error checking verification status:", error);
    res.status(500).json({ error: "Failed to check status" });
  }
});
