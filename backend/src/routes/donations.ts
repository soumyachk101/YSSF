import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { getUserFromRequest } from "../lib/auth.js";
import { z } from "zod";

export const donationsRoutes = Router();

const createDonationSchema = z.object({
  amount: z.union([z.number().positive().max(10000000), z.string().transform((v) => Number(v))]),
  donorName: z.string().min(1, "Donor name is required"),
  donorEmail: z.string().email("Invalid email format"),
  campaignId: z.string().min(1, "Campaign ID is required"),
});

// GET /api/donations (admin only or own donations)
donationsRoutes.get("/", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const { campaignId } = req.query;
    const where: Record<string, unknown> = {};

    if (user.role.toUpperCase() === "ADMIN") {
      if (campaignId) where.campaignId = campaignId;
    } else {
      where.userId = user.id;
    }

    const donations = await prisma.donation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { campaign: true },
      select: {
        id: true,
        amount: true,
        donorName: true,
        donorEmail: true,
        campaignId: true,
        userId: true,
        paymentRef: true,
        createdAt: true,
        campaign: true,
      },
    });

    res.json(donations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({ error: "Failed to fetch donations" });
  }
});

// POST /api/donations
donationsRoutes.post("/", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    const parseResult = createDonationSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues[0].message });
      return;
    }

    const { amount, donorName, donorEmail, campaignId } = parseResult.data;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    const donation = await prisma.donation.create({
      data: {
        amount: Number(amount),
        donorName,
        donorEmail,
        campaignId,
        userId: user?.id || null,
        paymentRef: `PENDING-${Date.now()}`,
      },
      include: { campaign: true },
    });

    res.status(201).json(donation);
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({ error: "Failed to create donation" });
  }
});
