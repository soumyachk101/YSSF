import { Router } from "express";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { SECRET, getUserFromRequest } from "../lib/auth.js";

export const authRoutes = Router();

const PUBLIC_ROLES = ["volunteer", "donor", "ngo_partner"] as const;

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional().nullable(),
  role: z.enum(PUBLIC_ROLES).default("volunteer"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email format"),
  code: z.string().length(6, "OTP must be 6 digits"),
});

const registerFullSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional().nullable(),
  role: z.enum(PUBLIC_ROLES),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  dob: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  skills: z.string().optional().nullable(),
  availability: z.string().optional().nullable(),
  emergencyName: z.string().optional().nullable(),
  emergencyPhone: z.string().optional().nullable(),
  panTaxId: z.string().optional().nullable(),
  preferredCauses: z.string().optional().nullable(),
  orgName: z.string().optional().nullable(),
  regNumber: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  mission: z.string().optional().nullable(),
  employeeId: z.string().optional().nullable(),
  roleLevel: z.string().optional().nullable(),
});

// POST /api/auth/register
authRoutes.post("/register", async (req, res) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const { name, email, phone, role, password } = parseResult.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        role,
        dob: "",
        location: "",
        passwordHash: hashedPassword,
      },
    });

    // Generate and send OTP
    const otp = generateOTP();
    await prisma.verification.create({
      data: {
        userId: user.id,
        code: otp,
        type: "email_otp",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // TODO: Send OTP via email service (SendGrid, nodemailer, etc.)
    console.log(`[EMAIL VERIFICATION] OTP for ${email}: ${otp}`);

    const token = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("2h")
      .sign(SECRET);

    res.status(201).json({
      success: true,
      user: { id: user.id, name: user.name, role: user.role },
      token,
      verificationRequired: true,
      message: "OTP sent to your email. Please verify to continue.",
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// POST /api/auth/send-verification
authRoutes.post("/send-verification", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ error: "Email already verified" });
      return;
    }

    // Invalidate any existing OTPs
    await prisma.verification.updateMany({
      where: { userId: user.id, type: "email_otp", used: false },
      data: { used: true },
    });

    const otp = generateOTP();
    await prisma.verification.create({
      data: {
        userId: user.id,
        code: otp,
        type: "email_otp",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // TODO: Send OTP via email service
    console.log(`[EMAIL VERIFICATION] OTP for ${user.email}: ${otp}`);

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error sending verification:", error);
    res.status(500).json({ error: "Failed to send verification code" });
  }
});

// POST /api/auth/verify-email
authRoutes.post("/verify-email", async (req, res) => {
  try {
    const parseResult = verifyEmailSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const { email, code } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ error: "Email already verified" });
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

    // Mark verification as used and user as verified
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

    const token = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("2h")
      .sign(SECRET);

    res.json({
      success: true,
      message: "Email verified successfully",
      user: { id: user.id, name: user.name, role: user.role },
      token,
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ error: "Failed to verify email" });
  }
});

// POST /api/auth/resend-verification
authRoutes.post("/resend-verification", async (req, res) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      res.json({ success: true, message: "If an account exists, OTP has been sent" });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ error: "Email already verified" });
      return;
    }

    // Invalidate existing OTPs
    await prisma.verification.updateMany({
      where: { userId: user.id, type: "email_otp", used: false },
      data: { used: true },
    });

    const otp = generateOTP();
    await prisma.verification.create({
      data: {
        userId: user.id,
        code: otp,
        type: "email_otp",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // TODO: Send OTP via email service
    console.log(`[EMAIL VERIFICATION] OTP for ${email}: ${otp}`);

    res.json({ success: true, message: "If an account exists, OTP has been sent" });
  } catch (error) {
    console.error("Error resending verification:", error);
    res.status(500).json({ error: "Failed to resend verification code" });
  }
});

// POST /api/auth/login
authRoutes.post("/login", async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("2h")
      .sign(SECRET);

    res.json({
      success: true,
      user: { id: user.id, name: user.name, role: user.role },
      token,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Failed to log in" });
  }
});

// GET /api/auth/me
authRoutes.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      res.status(401).json({ user: null });
      return;
    }

    const { jwtVerify } = await import("jose");
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, emailVerified: true },
    });

    if (!user) {
      res.status(401).json({ user: null });
      return;
    }

    res.json({ user });
  } catch {
    res.status(401).json({ user: null });
  }
});

// POST /api/auth/register-full
authRoutes.post("/register-full", async (req, res) => {
  try {
    const parseResult = registerFullSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const { name, email, phone, role, password, ...otherFields } = parseResult.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: "A user with this email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const userData: Record<string, unknown> = {
      name,
      email,
      phone: phone || null,
      role,
      passwordHash: hashedPassword,
    };

    const roleFields: Record<string, string[]> = {
      volunteer: ["dob", "location", "skills", "availability", "emergencyName", "emergencyPhone"],
      donor: ["panTaxId", "preferredCauses"],
      ngo_partner: ["orgName", "regNumber", "website", "address", "mission", "preferredCauses"],
    };

    const allowedFields = roleFields[role] || [];
    for (const field of allowedFields) {
      const val = (otherFields as Record<string, unknown>)[field];
      if (val !== undefined) {
        userData[field] = val;
      }
    }

    const user = await prisma.user.create({ data: userData as never });

    // Generate and send OTP
    const otp = generateOTP();
    await prisma.verification.create({
      data: {
        userId: user.id,
        code: otp,
        type: "email_otp",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // TODO: Send OTP via email service
    console.log(`[EMAIL VERIFICATION] OTP for ${email}: ${otp}`);

    const token = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("2h")
      .sign(SECRET);

    res.status(201).json({
      success: true,
      user: { id: user.id, name: user.name, role: user.role },
      token,
      verificationRequired: true,
      message: "OTP sent to your email. Please verify to continue.",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// POST /api/auth/google-mock (dev only)
authRoutes.post("/google-mock", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    res.status(404).json({ error: "Not found" });
    return;
  }

  try {
    const email = "google-volunteer@yssf.org";
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: "google-volunteer-001",
          name: "Google Volunteer",
          email,
          role: "volunteer",
          phone: "9999999999",
          dob: "2000-01-01",
          location: "Kolkata, WB",
          skills: "Environment, Community Services",
          availability: "Weekends",
          passwordHash: "",
        },
      });
    }

    const token = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("2h")
      .sign(SECRET);

    res.json({
      success: true,
      user: { id: user.id, name: user.name, role: user.role },
      token,
    });
  } catch (error) {
    console.error("Error in mock Google login:", error);
    res.status(500).json({ error: "Failed mock Google sign-in" });
  }
});

// POST /api/auth/signout
authRoutes.post("/signout", (_req, res) => {
  res.json({ success: true });
});
