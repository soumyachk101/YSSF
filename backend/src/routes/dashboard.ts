import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { getUserFromRequest } from "../lib/auth.js";

export const dashboardRoutes = Router();

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  location: true,
  skills: true,
  availability: true,
  createdAt: true,
};

// GET /api/dashboard/stats
dashboardRoutes.get("/stats", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        ...userSelect,
        donations: { include: { campaign: true }, orderBy: { createdAt: "desc" } },
        eventRegistrations: { include: { event: true } },
      },
    });

    if (!dbUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const totalDonated = dbUser.donations.reduce((sum, d) => sum + d.amount, 0);
    const eventsAttended = dbUser.eventRegistrations.length;

    res.json({
      user: dbUser,
      stats: {
        totalDonated,
        eventsAttended,
        volunteerHours: eventsAttended * 6,
        impactScore: Math.min(100, eventsAttended * 10 + Math.floor(totalDonated / 1000)),
      },
      recentDonations: dbUser.donations.slice(0, 5),
      recentRegistrations: dbUser.eventRegistrations.slice(0, 5),
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// GET /api/dashboard/donation-history
dashboardRoutes.get("/donation-history", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const donations = await prisma.donation.findMany({
      where: { userId: user.id },
      include: { campaign: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(donations);
  } catch (error) {
    console.error("Error fetching donation history:", error);
    res.status(500).json({ error: "Failed to fetch donation history" });
  }
});

// GET /api/dashboard/admin-stats
dashboardRoutes.get("/admin-stats", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (user.role.toUpperCase() !== "ADMIN") {
      res.status(403).json({ error: "Forbidden: Admin access required" });
      return;
    }

    const [totalUsers, totalDonations, activeCampaigns, pendingVerifications] = await Promise.all([
      prisma.user.count(),
      prisma.donation.aggregate({ _sum: { amount: true } }),
      prisma.campaign.count({ where: { status: "active" } }),
      prisma.eventRegistration.count({ where: { status: "pending" } }),
    ]);

    const recentDonations = await prisma.donation.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { campaign: true },
    });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: userSelect,
    });

    res.json({
      totalUsers,
      totalDonations: totalDonations._sum.amount || 0,
      activeCampaigns,
      pendingVerifications,
      recentDonations,
      recentUsers,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

// GET /api/dashboard/users
dashboardRoutes.get("/users", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (user.role.toUpperCase() !== "ADMIN") {
      res.status(403).json({ error: "Forbidden: Admin access required" });
      return;
    }

    const { role, search } = req.query;
    const where: Record<string, unknown> = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: userSelect,
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET /api/dashboard/gallery
dashboardRoutes.get("/gallery", async (req, res) => {
  try {
    const { category } = req.query;

    const where: Record<string, unknown> = {};
    if (category) {
      where.category = category;
    }

    const items = await prisma.galleryItem.findMany({
      where,
      orderBy: { date: "desc" },
    });

    res.json(items);
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    res.status(500).json({ error: "Failed to fetch gallery items" });
  }
});
