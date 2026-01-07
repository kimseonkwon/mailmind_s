import { 
  emails, 
  importLogs,
  type Email, 
  type InsertEmail,
  type ImportLog,
  type InsertImportLog,
  type SearchResult,
  type Stats,
  users,
  type User,
  type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, or, ilike, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getEmailsCount(): Promise<number>;
  getLastImport(): Promise<ImportLog | undefined>;
  getStats(): Promise<Stats>;
  
  insertEmail(email: InsertEmail): Promise<Email>;
  insertEmails(emails: InsertEmail[]): Promise<number>;
  
  searchEmails(query: string, topK: number): Promise<SearchResult[]>;
  
  logImport(log: InsertImportLog): Promise<ImportLog>;
}

function tokenize(query: string): string[] {
  return (query || "").trim().split(/\s+/).filter(t => t.length > 0);
}

function scoreText(text: string, tokens: string[]): number {
  if (!text || tokens.length === 0) return 0;
  const lower = text.toLowerCase();
  let score = 0;
  for (const token of tokens) {
    const regex = new RegExp(token.toLowerCase(), 'gi');
    const matches = lower.match(regex);
    if (matches) {
      score += matches.length;
    }
  }
  return score;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getEmailsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(emails);
    return result[0]?.count ?? 0;
  }

  async getLastImport(): Promise<ImportLog | undefined> {
    const [log] = await db
      .select()
      .from(importLogs)
      .orderBy(desc(importLogs.createdAt))
      .limit(1);
    return log || undefined;
  }

  async getStats(): Promise<Stats> {
    const count = await this.getEmailsCount();
    const lastImport = await this.getLastImport();
    
    return {
      mode: "PostgreSQL",
      emailsCount: count,
      lastImport: lastImport?.createdAt?.toISOString() ?? null,
    };
  }

  async insertEmail(email: InsertEmail): Promise<Email> {
    const [inserted] = await db.insert(emails).values(email).returning();
    return inserted;
  }

  async insertEmails(emailsToInsert: InsertEmail[]): Promise<number> {
    if (emailsToInsert.length === 0) return 0;
    
    const batchSize = 100;
    let inserted = 0;
    
    await db.transaction(async (tx) => {
      for (let i = 0; i < emailsToInsert.length; i += batchSize) {
        const batch = emailsToInsert.slice(i, i + batchSize);
        await tx.insert(emails).values(batch);
        inserted += batch.length;
      }
    });
    
    return inserted;
  }

  async searchEmails(query: string, topK: number): Promise<SearchResult[]> {
    const tokens = tokenize(query);
    if (tokens.length === 0) return [];

    const searchPattern = `%${query}%`;
    
    const results = await db
      .select()
      .from(emails)
      .where(
        or(
          ilike(emails.subject, searchPattern),
          ilike(emails.body, searchPattern),
          ilike(emails.sender, searchPattern),
          ilike(emails.date, searchPattern)
        )
      )
      .limit(100);

    const scored: SearchResult[] = results.map(email => {
      const textToScore = `${email.subject} ${email.body}`;
      const score = scoreText(textToScore, tokens);
      
      return {
        mailId: String(email.id),
        subject: email.subject || "(제목 없음)",
        score,
        sender: email.sender || null,
        date: email.date || null,
        body: email.body || "",
        attachments: [],
      };
    }).filter(r => r.score > 0);

    scored.sort((a, b) => b.score - a.score);
    
    return scored.slice(0, Math.max(1, topK));
  }

  async logImport(log: InsertImportLog): Promise<ImportLog> {
    const [inserted] = await db.insert(importLogs).values(log).returning();
    return inserted;
  }
}

export const storage = new DatabaseStorage();
