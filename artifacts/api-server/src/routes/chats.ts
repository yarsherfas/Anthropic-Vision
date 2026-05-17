import { Router } from "express";
import { db } from "@workspace/db";
import { chatsTable, charactersTable, messagesTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const rows = await db.execute(sql`
      SELECT
        ch.id,
        ch.character_id AS "characterId",
        ch.title,
        ch.last_message_at AS "lastMessageAt",
        ch.message_count AS "messageCount",
        c.name AS "characterName",
        c.avatar_url AS "characterAvatarUrl"
      FROM chats ch
      JOIN characters c ON c.id = ch.character_id
      ORDER BY ch.last_message_at DESC NULLS LAST, ch.created_at DESC
    `);
    res.json(rows.rows.map(formatChat));
  } catch (err) {
    req.log.error({ err }, "Failed to list chats");
    res.status(500).json({ error: "Failed to list chats" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { characterId, title } = req.body;
    if (!characterId) return res.status(400).json({ error: "characterId is required" });
    const [character] = await db.select().from(charactersTable).where(eq(charactersTable.id, characterId));
    if (!character) return res.status(404).json({ error: "Character not found" });

    const chatTitle = title || `Chat with ${character.name}`;
    const [chat] = await db.insert(chatsTable).values({
      characterId,
      title: chatTitle,
    }).returning();

    res.status(201).json({
      id: chat.id,
      characterId: chat.characterId,
      characterName: character.name,
      characterAvatarUrl: character.avatarUrl,
      title: chat.title,
      lastMessageAt: null,
      messageCount: 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create chat");
    res.status(500).json({ error: "Failed to create chat" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const rows = await db.execute(sql`
      SELECT
        ch.id,
        ch.character_id AS "characterId",
        ch.title,
        ch.last_message_at AS "lastMessageAt",
        ch.message_count AS "messageCount",
        c.name AS "characterName",
        c.avatar_url AS "characterAvatarUrl"
      FROM chats ch
      JOIN characters c ON c.id = ch.character_id
      WHERE ch.id = ${id}
    `);
    if (!rows.rows.length) return res.status(404).json({ error: "Chat not found" });
    res.json(formatChat(rows.rows[0]));
  } catch (err) {
    req.log.error({ err }, "Failed to get chat");
    res.status(500).json({ error: "Failed to get chat" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(chatsTable).where(eq(chatsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete chat");
    res.status(500).json({ error: "Failed to delete chat" });
  }
});

function formatChat(r: any) {
  return {
    id: r.id,
    characterId: r.characterId,
    characterName: r.characterName,
    characterAvatarUrl: r.characterAvatarUrl,
    title: r.title,
    lastMessageAt: r.lastMessageAt ? new Date(r.lastMessageAt).toISOString() : null,
    messageCount: Number(r.messageCount),
  };
}

export default router;
