import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const blogRoutes = Router();

// GET /api/blog
blogRoutes.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    const where: Record<string, unknown> = { published: true };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { excerpt: { contains: search as string } },
        { content: { contains: search as string } },
      ];
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

// GET /api/blog/:slug
blogRoutes.get("/:slug", async (req, res) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug, published: true },
    });

    if (!post) {
      res.status(404).json({ error: "Blog post not found" });
      return;
    }

    res.json(post);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});
