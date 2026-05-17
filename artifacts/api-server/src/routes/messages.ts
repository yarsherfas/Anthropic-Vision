import { Router } from "express";
import { db } from "@workspace/db";
import { messagesTable } from "@workspace/db";
import { eq, asc, sql } from "drizzle-orm";
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.swiftrouter.com/v1",
  apiKey: process.env.GLM_API_KEY!,
});

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

    const history = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.chatId, chatId))
      .orderBy(asc(messagesTable.createdAt));

    const systemPrompt = `You are ${charName}. Stay fully in character at all times. ${persona} Respond naturally as this character would — with their voice, mannerisms, and perspective. Keep responses concise and engaging (2-4 sentences unless depth is needed). Never break character or mention being an AI.`;

    const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await client.chat.completions.create({
      model: "glm-5.1",
      messages: chatMessages,
    });

    const aiReply = completion.choices[0]?.message?.content ?? "...";

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
