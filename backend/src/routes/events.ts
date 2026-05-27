import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { getUserFromRequest } from "../lib/auth.js";
import { z } from "zod";

export const eventsRoutes = Router();

const registerEventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone number is required"),
});

// GET /api/events
eventsRoutes.get("/", async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { registrations: true } },
      },
    });

    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// GET /api/events/:id
eventsRoutes.get("/:id", async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { slug: req.params.id },
      include: {
        _count: { select: { registrations: true } },
      },
    });

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

// POST /api/events/:id/register
eventsRoutes.post("/:id/register", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    const parseResult = registerEventSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const { name, email, phone } = parseResult.data;

    const event = await prisma.event.findUnique({
      where: { slug: req.params.id },
    });

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    const existing = await prisma.eventRegistration.findFirst({
      where: { eventId: event.id, email },
    });

    if (existing) {
      res.status(409).json({ error: "You have already registered for this event" });
      return;
    }

    const registration = await prisma.eventRegistration.create({
      data: { name, email, phone, eventId: event.id, userId: user?.id || null },
      include: { event: true },
    });

    res.status(201).json(registration);
  } catch (error) {
    console.error("Error registering for event:", error);
    res.status(500).json({ error: "Failed to register for event" });
  }
});
