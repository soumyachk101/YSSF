import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { getUserFromRequest } from "../lib/auth.js";
import { z } from "zod";

export const contactRoutes = Router();

const contactMessageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional().nullable(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

// POST /api/contact (public)
contactRoutes.post("/", async (req, res) => {
  try {
    const parseResult = contactMessageSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues[0].message });
      return;
    }

    const { name, email, phone, subject, message } = parseResult.data;

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
      },
    });

    res.status(201).json({ success: true, id: contactMessage.id });
  } catch (error) {
    console.error("Error creating contact message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// GET /api/contact (admin only)
contactRoutes.get("/", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role.toUpperCase() !== "ADMIN") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const { read } = req.query;
    const where: Record<string, unknown> = {};

    if (read !== undefined) {
      where.read = read === "true";
    }

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});
