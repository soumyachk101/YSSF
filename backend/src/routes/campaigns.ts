import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const campaignsRoutes = Router();

// GET /api/campaigns
campaignsRoutes.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

// GET /api/campaigns/:id
campaignsRoutes.get("/:id", async (req, res) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { slug: req.params.id },
      include: {
        donations: {
          select: { amount: true, createdAt: true },
        },
      },
    });

    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    res.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ error: "Failed to fetch campaign" });
  }
});
