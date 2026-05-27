import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { authRoutes } from "./routes/auth.js";
import { campaignsRoutes } from "./routes/campaigns.js";
import { eventsRoutes } from "./routes/events.js";
import { donationsRoutes } from "./routes/donations.js";
import { contactRoutes } from "./routes/contact.js";
import { blogRoutes } from "./routes/blog.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { verifyRoutes } from "./routes/verify.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet());

// Body size limit
app.use(express.json({ limit: "100kb" }));

// CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiters
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/register-full", authLimiter);
app.use("/api/auth/verify-email", authLimiter);
app.use("/api/auth/resend-verification", authLimiter);
app.use("/api/verify/send-otp", authLimiter);
app.use("/api/verify/send-link", authLimiter);
app.use("/api/verify/verify-otp", authLimiter);
app.use("/api/verify/verify-link", authLimiter);
app.use("/api/contact", authLimiter);
app.use("/api", generalLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/campaigns", campaignsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/donations", donationsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const server = app.listen(PORT, () => {
  console.log(`YSSF Backend running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});
