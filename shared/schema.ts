import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull().default(""),
  sender: text("sender").notNull().default(""),
  date: text("date").notNull().default(""),
  body: text("body").notNull().default(""),
  importance: text("importance"),
  label: text("label"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmailSchema = createInsertSchema(emails).omit({
  id: true,
  createdAt: true,
});

export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Email = typeof emails.$inferSelect;

export const importLogs = pgTable("import_logs", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  emailsImported: serial("emails_imported").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertImportLogSchema = createInsertSchema(importLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertImportLog = z.infer<typeof insertImportLogSchema>;
export type ImportLog = typeof importLogs.$inferSelect;

export const searchResultSchema = z.object({
  mailId: z.string(),
  subject: z.string(),
  score: z.number(),
  sender: z.string().nullable(),
  date: z.string().nullable(),
  body: z.string(),
  attachments: z.array(z.string()).optional(),
});

export type SearchResult = z.infer<typeof searchResultSchema>;

export const statsSchema = z.object({
  mode: z.string(),
  emailsCount: z.number(),
  lastImport: z.string().nullable(),
});

export type Stats = z.infer<typeof statsSchema>;

export const chatRequestSchema = z.object({
  message: z.string().min(1, "검색어를 입력해주세요"),
  topK: z.number().min(1).max(50).default(10),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const chatResponseSchema = z.object({
  answer: z.string(),
  citations: z.array(searchResultSchema),
  debug: z.object({
    topK: z.number(),
    hitsCount: z.number(),
  }).optional(),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;

export const importResultSchema = z.object({
  ok: z.boolean(),
  inserted: z.number(),
  message: z.string().optional(),
});

export type ImportResult = z.infer<typeof importResultSchema>;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
