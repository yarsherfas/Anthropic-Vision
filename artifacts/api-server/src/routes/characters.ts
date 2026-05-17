import { Router } from "express";
import { db } from "@workspace/db";
import { charactersTable } from "@workspace/db";
import { eq, sql, ilike, and } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    let conditions: any[] = [];
    if (category) conditions.push(eq(charactersTable.category, category as string));
    if (search) conditions.push(ilike(charactersTable.name, `%${search}%`));
    if (featured === "true") conditions.push(eq(charactersTable.isFeatured, true));

    const characters = await db
      .select()
      .from(charactersTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sql`${charactersTable.messageCount} DESC`);
    res.json(characters.map(formatCharacter));
  } catch (err) {
    req.log.error({ err }, "Failed to list characters");
    res.status(500).json({ error: "Failed to list characters" });
  }
});

router.get("/featured", async (req, res) => {
  try {
    const characters = await db
      .select()
      .from(charactersTable)
      .where(eq(charactersTable.isFeatured, true))
      .orderBy(sql`${charactersTable.messageCount} DESC`)
      .limit(8);
    res.json(characters.map(formatCharacter));
  } catch (err) {
    req.log.error({ err }, "Failed to get featured characters");
    res.status(500).json({ error: "Failed to get featured characters" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT
        (SELECT COUNT(*) FROM characters) AS "totalCharacters",
        (SELECT COUNT(*) FROM chats) AS "totalChats",
        (SELECT COUNT(*) FROM messages) AS "totalMessages",
        (SELECT COUNT(*) FROM characters WHERE is_featured = true) AS "featuredCount"
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

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [character] = await db.select().from(charactersTable).where(eq(charactersTable.id, id));
    if (!character) return res.status(404).json({ error: "Character not found" });
    res.json(formatCharacter(character));
  } catch (err) {
    req.log.error({ err }, "Failed to get character");
    res.status(500).json({ error: "Failed to get character" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description, persona, category, avatarUrl, isFeatured } = req.body;
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
    }).returning();
    res.status(201).json(formatCharacter(character));
  } catch (err) {
    req.log.error({ err }, "Failed to create character");
    res.status(500).json({ error: "Failed to create character" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updates: any = {};
    const fields = ["name", "description", "persona", "category", "avatarUrl", "isFeatured"];
    for (const field of fields) {
      if (req.body[field] !== undefined) updates[field === "avatarUrl" ? "avatarUrl" : field] = req.body[field];
    }
    const [character] = await db
      .update(charactersTable)
      .set(updates)
      .where(eq(charactersTable.id, id))
      .returning();
    if (!character) return res.status(404).json({ error: "Character not found" });
    res.json(formatCharacter(character));
  } catch (err) {
    req.log.error({ err }, "Failed to update character");
    res.status(500).json({ error: "Failed to update character" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(charactersTable).where(eq(charactersTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete character");
    res.status(500).json({ error: "Failed to delete character" });
  }
});

function formatCharacter(c: any) {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    persona: c.persona,
    category: c.category,
    avatarUrl: c.avatarUrl,
    messageCount: c.messageCount,
    isFeatured: c.isFeatured,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
  };
}

export default router;
