import { Router } from "express";
import { db } from "@workspace/db";
import { charactersTable } from "@workspace/db";
import { eq, sql, ilike, and, or } from "drizzle-orm";
import { optionalAuth, requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", optionalAuth, async (req, res) => {
  try {
    const { category, search, featured, mine } = req.query;
    const userId = req.user?.id;

    let conditions: any[] = [];

    if (mine === "true" && userId) {
      conditions.push(eq(charactersTable.userId, userId));
    } else {
      // Show public characters + user's own private ones
      if (userId) {
        conditions.push(
          or(
            eq(charactersTable.visibility, "public"),
            eq(charactersTable.userId, userId)
          )
        );
      } else {
        conditions.push(eq(charactersTable.visibility, "public"));
      }
    }

    if (category) conditions.push(eq(charactersTable.category, category as string));
    if (search) conditions.push(ilike(charactersTable.name, `%${search}%`));
    if (featured === "true") conditions.push(eq(charactersTable.isFeatured, true));

    const characters = await db
      .select()
      .from(charactersTable)
      .where(and(...conditions))
      .orderBy(sql`${charactersTable.messageCount} DESC`);

    res.json(characters.map((c) => formatCharacter(c, userId)));
  } catch (err) {
    req.log.error({ err }, "Failed to list characters");
    res.status(500).json({ error: "Failed to list characters" });
  }
});

router.get("/featured", optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const characters = await db
      .select()
      .from(charactersTable)
      .where(and(eq(charactersTable.isFeatured, true), eq(charactersTable.visibility, "public")))
      .orderBy(sql`${charactersTable.messageCount} DESC`)
      .limit(8);
    res.json(characters.map((c) => formatCharacter(c, userId)));
  } catch (err) {
    req.log.error({ err }, "Failed to get featured characters");
    res.status(500).json({ error: "Failed to get featured characters" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT
        (SELECT COUNT(*) FROM characters WHERE visibility = 'public') AS "totalCharacters",
        (SELECT COUNT(*) FROM chats) AS "totalChats",
        (SELECT COUNT(*) FROM messages) AS "totalMessages",
        (SELECT COUNT(*) FROM characters WHERE is_featured = true AND visibility = 'public') AS "featuredCount"
    `);
    const stats = result.rows[0] as any;
    res.json({
      totalCharacters: Number(stats.totalCharacters),
      totalChats: Number(stats.totalChats),
      totalMessages: Number(stats.totalMessages),
      featuredCount: Number(stats.featuredCount),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user?.id;
    const [character] = await db.select().from(charactersTable).where(eq(charactersTable.id, id));
    if (!character) return res.status(404).json({ error: "Character not found" });

    // Block access to private characters unless owner
    if (character.visibility === "private" && character.userId !== userId) {
      return res.status(404).json({ error: "Character not found" });
    }

    res.json(formatCharacter(character, userId));
  } catch (err) {
    req.log.error({ err }, "Failed to get character");
    res.status(500).json({ error: "Failed to get character" });
  }
});

router.post("/", optionalAuth, async (req, res) => {
  try {
    const { name, description, persona, category, avatarUrl, isFeatured, visibility } = req.body;
    if (!name || !description || !persona || !category) {
      return res.status(400).json({ error: "name, description, persona, category are required" });
    }
    const [character] = await db.insert(charactersTable).values({
      name,
      description,
      persona,
      category,
      avatarUrl: avatarUrl || null,
      isFeatured: isFeatured || false,
      visibility: visibility === "private" ? "private" : "public",
      userId: req.user?.id || null,
    }).returning();
    res.status(201).json(formatCharacter(character, req.user?.id));
  } catch (err) {
    req.log.error({ err }, "Failed to create character");
    res.status(500).json({ error: "Failed to create character" });
  }
});

router.patch("/:id", optionalAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user?.id;
    const [existing] = await db.select().from(charactersTable).where(eq(charactersTable.id, id));
    if (!existing) return res.status(404).json({ error: "Character not found" });

    // Only owner can edit (if it has an owner)
    if (existing.userId && existing.userId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updates: any = {};
    const fields = ["name", "description", "persona", "category", "avatarUrl", "isFeatured", "visibility"];
    for (const field of fields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    const [character] = await db
      .update(charactersTable)
      .set(updates)
      .where(eq(charactersTable.id, id))
      .returning();
    res.json(formatCharacter(character, userId));
  } catch (err) {
    req.log.error({ err }, "Failed to update character");
    res.status(500).json({ error: "Failed to update character" });
  }
});

router.delete("/:id", optionalAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user?.id;
    const [existing] = await db.select().from(charactersTable).where(eq(charactersTable.id, id));
    if (!existing) return res.status(404).json({ error: "Character not found" });

    if (existing.userId && existing.userId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await db.delete(charactersTable).where(eq(charactersTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete character");
    res.status(500).json({ error: "Failed to delete character" });
  }
});

function formatCharacter(c: any, requestingUserId?: string) {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    persona: c.persona,
    category: c.category,
    avatarUrl: c.avatarUrl,
    messageCount: c.messageCount,
    isFeatured: c.isFeatured,
    visibility: c.visibility,
    userId: c.userId,
    isOwner: requestingUserId ? c.userId === requestingUserId : false,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
  };
}

export default router;
