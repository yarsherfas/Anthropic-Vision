import { Router } from "express";
import { db } from "@workspace/db";
import { messagesTable, chatsTable, charactersTable } from "@workspace/db";
import { eq, asc, sql } from "drizzle-orm";

const router = Router({ mergeParams: true });

router.get("/", async (req, res) => {
  try {
    const chatId = parseInt(req.params.id, 10);
    const messages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.chatId, chatId))
      .orderBy(asc(messagesTable.createdAt));
    res.json(messages.map(formatMessage));
  } catch (err) {
    req.log.error({ err }, "Failed to list messages");
    res.status(500).json({ error: "Failed to list messages" });
  }
});

router.post("/", async (req, res) => {
  try {
    const chatId = parseInt(req.params.id, 10);
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "content is required" });

    const chatRows = await db.execute(sql`
      SELECT ch.id, ch.character_id AS "characterId", c.name, c.persona
      FROM chats ch
      JOIN characters c ON c.id = ch.character_id
      WHERE ch.id = ${chatId}
    `);
    if (!chatRows.rows.length) return res.status(404).json({ error: "Chat not found" });
    const { characterId, name: charName, persona } = chatRows.rows[0] as any;

    const [userMessage] = await db.insert(messagesTable).values({
      chatId,
      role: "user",
      content: content.trim(),
    }).returning();

    const aiReply = generateAiReply(charName, persona, content.trim());
    const [assistantMessage] = await db.insert(messagesTable).values({
      chatId,
      role: "assistant",
      content: aiReply,
    }).returning();

    await db.execute(sql`
      UPDATE chats SET
        message_count = message_count + 2,
        last_message_at = NOW()
      WHERE id = ${chatId}
    `);
    await db.execute(sql`
      UPDATE characters SET
        message_count = message_count + 2
      WHERE id = ${characterId}
    `);

    res.status(201).json({
      userMessage: formatMessage(userMessage),
      assistantMessage: formatMessage(assistantMessage),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to send message");
    res.status(500).json({ error: "Failed to send message" });
  }
});

function generateAiReply(name: string, persona: string, userMsg: string): string {
  const responses = [
    `*${name} considers your words carefully* That's a fascinating perspective. ${persona.slice(0, 80)}... Tell me more about what you mean.`,
    `As someone who ${persona.slice(0, 60).toLowerCase()}, I find your question deeply intriguing. What draws you to this topic?`,
    `*pauses thoughtfully* You know, "${userMsg.slice(0, 40)}..." — that really resonates with me. From my perspective, every question holds hidden depths worth exploring.`,
    `Interesting that you say that. In my experience, the most profound answers often come from asking better questions. What do you truly seek?`,
    `*${name} smiles* I appreciate your curiosity. Let me share my thoughts: the world is far more nuanced than it appears. What aspect would you like to explore further?`,
    `Your words carry weight. ${persona.slice(0, 60)}. This is exactly the kind of conversation I live for. Shall we go deeper?`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function formatMessage(m: any) {
  return {
    id: m.id,
    chatId: m.chatId,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
  };
}

export default router;
