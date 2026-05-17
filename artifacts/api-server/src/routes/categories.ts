import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, charactersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const rows = await db.execute(sql`
      SELECT c.id, c.name, c.slug,
             COUNT(ch.id)::int AS "characterCount"
      FROM categories c
      LEFT JOIN characters ch ON ch.category = c.slug
      GROUP BY c.id, c.name, c.slug
      ORDER BY "characterCount" DESC
    `);
    res.json(rows.rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      characterCount: Number(r.characterCount),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list categories");
    res.status(500).json({ error: "Failed to list categories" });
  }
});

export default router;
