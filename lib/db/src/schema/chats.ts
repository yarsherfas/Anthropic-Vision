import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { charactersTable } from "./characters";

export const chatsTable = pgTable("chats", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull().references(() => charactersTable.id, { onDelete: "cascade" }),
  userId: text("user_id"),
  title: text("title").notNull().default("New Chat"),
  lastMessageAt: timestamp("last_message_at"),
  messageCount: integer("message_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChatSchema = createInsertSchema(chatsTable).omit({ id: true, messageCount: true, createdAt: true, lastMessageAt: true });
export type InsertChat = z.infer<typeof insertChatSchema>;
export type Chat = typeof chatsTable.$inferSelect;
